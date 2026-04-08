import * as path from 'node:path';
import * as fs from 'node:fs';
import { loadTemplate } from '../core/load-template.js';
import { validateTemplate } from '../core/validate-template.js';
import { printValidationReport } from '../reports/validation-report.js';
import { writeFile } from '../io/index.js';
import { serializeValidationReport } from '../reports/validation-report.js';
import type { ValidateTemplateOptions, ValidationReport } from '../types/meta-source.types.js';

/**
 * Comando validate-template: valida se um template está pronto para geração.
 *
 * Usa o mesmo loadTemplate e validateTemplate do core V1, com relatório
 * de validação mais detalhado e cálculo de completude.
 */
export function runValidateTemplate(options: ValidateTemplateOptions): void {
  const { templateId, templatesDir } = options;

  console.log(`\n🔍 validate-template: Validando "${templateId}"...`);

  const templateDir = path.join(templatesDir, templateId);

  // Verificar existência básica
  if (!fs.existsSync(templateDir)) {
    throw new Error(`Template não encontrado: ${templateDir}`);
  }

  const metaDir = path.join(templateDir, 'meta');
  if (!fs.existsSync(metaDir)) {
    throw new Error(`Diretório meta/ não encontrado. Execute sync-meta primeiro.`);
  }

  const manifestPath = path.join(metaDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`meta/manifest.json não encontrado. Execute sync-meta primeiro.`);
  }

  // Carregar template usando o loader V1 existente
  let template;
  try {
    template = loadTemplate(templatesDir, templateId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Falha ao carregar template: ${msg}`);
  }

  // Executar validação V1
  const result = validateTemplate(template);

  // Montar relatório estendido
  const report: ValidationReport = {
    valid: result.valid,
    templateId,
    errors: result.errors,
    warnings: result.warnings,
    summary: {
      stepsCount: template.steps.length,
      routesCount: template.routes.routes.length,
      presetsCount: template.presets.length,
      blocksCount: template.blocks.length,
      blockInstancesCount: template.blockInstances.length,
      fieldSchemasCount: template.fieldSchemas.length,
      processVariablesCount: template.processVariables.length,
      dependenciesCount: template.dependencies.length,
      featuresCount: template.manifest.features.length,
    },
    completeness: calculateCompleteness(template, result),
  };

  printValidationReport(report);

  // Gravar relatório
  const reportPath = path.join(templateDir, '_validation-report.json');
  writeFile(reportPath, serializeValidationReport(report));
  console.log(`📄 Relatório gravado em: ${reportPath}\n`);

  if (!report.valid) {
    process.exit(1);
  }
}

/**
 * Calcula um grau aproximado de completude do template.
 * Verifica se as seções essenciais existem e têm dados.
 */
function calculateCompleteness(
  template: { steps: unknown[]; routes: { routes: unknown[] }; presets: unknown[]; blocks: unknown[]; blockInstances: unknown[]; fieldSchemas: unknown[]; processVariables: unknown[]; dependencies: unknown[]; manifest: { features: unknown[] } },
  validation: { errors: string[]; warnings: string[] },
): number {
  let score = 0;
  const weights = {
    manifest: 10,
    steps: 15,
    routes: 10,
    presets: 15,
    blocks: 10,
    blockInstances: 15,
    fieldSchemas: 5,
    processVariables: 10,
    dependencies: 5,
    features: 5,
  };

  // Cada seção com pelo menos 1 item recebe o peso
  if (template.steps.length > 0) score += weights.steps;
  if (template.routes.routes.length > 0) score += weights.routes;
  if (template.presets.length > 0) score += weights.presets;
  if (template.blocks.length > 0) score += weights.blocks;
  if (template.blockInstances.length > 0) score += weights.blockInstances;
  if (template.fieldSchemas.length > 0) score += weights.fieldSchemas;
  if (template.processVariables.length > 0) score += weights.processVariables;
  if (template.dependencies.length > 0) score += weights.dependencies;
  if (template.manifest.features.length > 0) score += weights.features;

  // Manifest sempre presente se chegou aqui
  score += weights.manifest;

  // Penalizar por erros
  const errorPenalty = Math.min(validation.errors.length * 5, 30);
  score = Math.max(0, score - errorPenalty);

  return score;
}
