import type { GenerationOperation } from '../types/generator.types.js';
import type { TransformContext } from '../core/apply-generation-plan.js';

/**
 * disable_step: Registra o step como desabilitado no contexto.
 * O meta gerado é atualizado em writeGeneratedMeta (apply-generation-plan).
 */
export function applyDisableStep(ctx: TransformContext, op: GenerationOperation): void {
  ctx.disabledSteps.add(op.target);
}
