import type {
  GenerationRequest,
  GenerationPlan,
  GenerationOperation,
  LoadedTemplate,
  OperationType,
} from '../types/generator.types.js';
import { resolvePreset } from './resolve-preset.js';

/** Ordem de execução das operações */
const OPERATION_ORDER: OperationType[] = [
  'disable_feature',
  'disable_step',
  'disable_route',
  'remove_block_instance',
  'filter_process_variables_by_feature',
  'rename_label',
];

/**
 * Constrói o plano de geração completo a partir do request e do template.
 *
 * 1. Resolve o preset em operações
 * 2. Adiciona customizações do request
 * 3. Deduplica
 * 4. Ordena pela ordem canônica
 */
export function buildGenerationPlan(
  template: LoadedTemplate,
  request: GenerationRequest,
  outputDir: string,
): GenerationPlan {
  // Operações do preset
  const presetOps = resolvePreset(template, request.presetId);

  // Operações de customização
  const customOps: GenerationOperation[] = (request.customizations ?? []).map((c) => ({
    type: c.operation,
    target: (c.params['target'] as string) ?? '_custom',
    reason: `Customização manual: ${c.operation}`,
    params: c.params,
  }));

  // Combinar e deduplicar
  const allOps = [...presetOps, ...customOps];
  const seen = new Set<string>();
  const dedupedOps = allOps.filter((op) => {
    const key = `${op.type}::${op.target}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Ordenar
  const sortedOps = dedupedOps.sort((a, b) => {
    const ai = OPERATION_ORDER.indexOf(a.type);
    const bi = OPERATION_ORDER.indexOf(b.type);
    return ai - bi;
  });

  return {
    templateId: request.templateId,
    presetId: request.presetId,
    projectName: request.project.name,
    outputDir,
    operations: sortedOps,
  };
}
