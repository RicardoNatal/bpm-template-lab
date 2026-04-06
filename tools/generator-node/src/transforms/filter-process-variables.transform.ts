import * as path from 'node:path';
import type { GenerationOperation } from '../types/generator.types.js';
import type { TransformContext } from '../core/apply-generation-plan.js';
import { writeJson } from '../io/index.js';

/**
 * filter_process_variables_by_feature: Filtra variáveis de processo vinculadas
 * a features desabilitadas e grava o resultado no meta gerado.
 *
 * V1: Atualiza apenas o meta gerado (_meta/process-variables.json).
 * Não altera o código Angular — isso seria escopo de versão futura.
 */
export function applyFilterProcessVariables(ctx: TransformContext, op: GenerationOperation): void {
  const disabledFeatures = (op.params?.['disabledFeatures'] as string[]) ?? [];

  if (disabledFeatures.length === 0) {
    return;
  }

  const disabledSet = new Set(disabledFeatures);
  const outputMetaDir = path.join(ctx.outputProjectDir, '_meta');

  const filtered = ctx.template.processVariables.filter((pv) => {
    if (pv.requiredFeature && disabledSet.has(pv.requiredFeature)) {
      return false;
    }
    return true;
  });

  const removed = ctx.template.processVariables.length - filtered.length;

  writeJson(path.join(outputMetaDir, 'process-variables.json'), filtered);
  ctx.filesModified.add('_meta/process-variables.json');

  if (removed > 0) {
    console.log(`     ${removed} variável(is) de processo removida(s) por feature desabilitada`);
  }
}
