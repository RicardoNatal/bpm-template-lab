import type { GenerationOperation } from '../types/generator.types.js';
import type { TransformContext } from '../core/apply-generation-plan.js';

/**
 * disable_feature: Registra a feature como desabilitada no contexto.
 * O meta gerado é atualizado em writeGeneratedMeta (apply-generation-plan).
 */
export function applyDisableFeature(ctx: TransformContext, op: GenerationOperation): void {
  ctx.disabledFeatures.add(op.target);
}
