import * as path from 'node:path';
import { copyDir, writeJson } from '../io/index.js';
import type {
  LoadedTemplate,
  GenerationPlan,
  GenerationReport,
  OperationResult,
} from '../types/generator.types.js';
import { applyDisableStep } from '../transforms/disable-step.transform.js';
import { applyDisableRoute } from '../transforms/disable-route.transform.js';
import { applyDisableFeature } from '../transforms/disable-feature.transform.js';
import { applyRemoveBlockInstance } from '../transforms/remove-block-instance.transform.js';
import { applyFilterProcessVariables } from '../transforms/filter-process-variables.transform.js';
import { applyRenameLabel } from '../transforms/rename-label.transform.js';

export interface TransformContext {
  /** Caminho absoluto do projeto gerado (cópia em output/) */
  outputProjectDir: string;
  /** Template carregado (metadados originais) */
  template: LoadedTemplate;
  /** Acumula warnings */
  warnings: string[];
  /** Acumula arquivos modificados */
  filesModified: Set<string>;
  /** Steps desabilitados até agora (para coordenação entre transforms) */
  disabledSteps: Set<string>;
  /** Features desabilitadas até agora */
  disabledFeatures: Set<string>;
}

/**
 * Aplica o plano de geração:
 * 1. Copia project/ para output/
 * 2. Copia meta/ para output/_meta/ (meta gerado da variante)
 * 3. Aplica cada operação na ordem do plano
 * 4. Gera o relatório
 */
export function applyGenerationPlan(
  template: LoadedTemplate,
  plan: GenerationPlan,
): GenerationReport {
  const startTime = Date.now();
  const outputProjectDir = plan.outputDir;
  const outputMetaDir = path.join(plan.outputDir, '_meta');

  // 1. Copiar projeto base
  console.log(`\n📁 Copiando projeto base para ${outputProjectDir}...`);
  copyDir(template.projectDir, outputProjectDir);

  // 2. Copiar meta para _meta (será modificado pelos transforms)
  console.log(`📋 Copiando metadados para ${outputMetaDir}...`);
  copyDir(template.metaDir, outputMetaDir);

  const ctx: TransformContext = {
    outputProjectDir,
    template,
    warnings: [],
    filesModified: new Set(),
    disabledSteps: new Set(),
    disabledFeatures: new Set(),
  };

  // 3. Aplicar operações
  const results: OperationResult[] = [];

  for (const op of plan.operations) {
    console.log(`  ⚙️  ${op.type} → ${op.target}`);
    try {
      switch (op.type) {
        case 'disable_step':
          applyDisableStep(ctx, op);
          break;
        case 'disable_route':
          applyDisableRoute(ctx, op);
          break;
        case 'disable_feature':
          applyDisableFeature(ctx, op);
          break;
        case 'remove_block_instance':
          applyRemoveBlockInstance(ctx, op);
          break;
        case 'filter_process_variables_by_feature':
          applyFilterProcessVariables(ctx, op);
          break;
        case 'rename_label':
          applyRenameLabel(ctx, op);
          break;
        default:
          ctx.warnings.push(`Operação não suportada na V1: ${op.type}`);
          results.push({ type: op.type, target: op.target, success: false, detail: 'Não suportada na V1' });
          continue;
      }
      results.push({ type: op.type, target: op.target, success: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ type: op.type, target: op.target, success: false, detail: msg });
      ctx.warnings.push(`Falha em ${op.type} → ${op.target}: ${msg}`);
    }
  }

  // 4. Gravar meta gerado atualizado
  writeGeneratedMeta(ctx, outputMetaDir);

  const duration = Date.now() - startTime;

  return {
    success: results.every((r) => r.success),
    templateId: plan.templateId,
    presetId: plan.presetId,
    projectName: plan.projectName,
    outputDir: plan.outputDir,
    operationsExecuted: results,
    warnings: ctx.warnings,
    filesModified: [...ctx.filesModified],
    duration,
  };
}

/**
 * Grava os metadados da variante gerada em _meta/.
 * Filtra steps, routes, features, etc., conforme operações aplicadas.
 */
function writeGeneratedMeta(ctx: TransformContext, outputMetaDir: string): void {
  const { template } = ctx;

  // Filtrar steps ativos
  const activeSteps = template.steps.filter((s) => !ctx.disabledSteps.has(s.id));
  writeJson(path.join(outputMetaDir, 'steps.json'), activeSteps);

  // Filtrar routes ativas
  const activeRoutes = template.routes.routes.filter((r) => !ctx.disabledSteps.has(r.stepId));
  const activeStepRouteMap: Record<string, string> = {};
  const activeRouteStepMap: Record<string, string> = {};
  for (const r of activeRoutes) {
    activeStepRouteMap[r.stepId] = r.path;
    activeRouteStepMap[r.path] = r.stepId;
  }
  writeJson(path.join(outputMetaDir, 'routes.json'), {
    routes: activeRoutes,
    stepRouteMap: activeStepRouteMap,
    routeStepMap: activeRouteStepMap,
  });

  // Filtrar features ativas
  const activeFeatures = template.manifest.features.filter(
    (f) => !ctx.disabledFeatures.has(f.id),
  );
  const updatedManifest = {
    ...template.manifest,
    features: activeFeatures,
  };
  writeJson(path.join(outputMetaDir, 'manifest.json'), updatedManifest);

  ctx.filesModified.add('_meta/steps.json');
  ctx.filesModified.add('_meta/routes.json');
  ctx.filesModified.add('_meta/manifest.json');
}
