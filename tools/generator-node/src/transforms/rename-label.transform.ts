import type { GenerationOperation } from '../types/generator.types.js';
import type { TransformContext } from '../core/apply-generation-plan.js';

/**
 * rename_label: Renomeia um label em metadados e/ou templates HTML.
 *
 * V1: NOOP com warning.
 * A operação rename_label requer mapeamento label → arquivo(s) HTML a editar,
 * que não está suficientemente detalhado nos metadados atuais.
 * Será implementada em versão futura quando o meta incluir coordenadas de label.
 */
export function applyRenameLabel(ctx: TransformContext, op: GenerationOperation): void {
  ctx.warnings.push(
    `rename_label: Operação não implementada na V1. ` +
    `Target: "${op.target}". ` +
    `Será suportada quando o meta incluir mapeamento de labels para arquivos.`,
  );
}
