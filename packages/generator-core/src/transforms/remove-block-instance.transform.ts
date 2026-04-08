import * as path from 'node:path';
import type { GenerationOperation } from '../types/generator.types.js';
import type { TransformContext } from '../core/apply-generation-plan.js';
import { readFile, writeFile } from '../io/index.js';

/**
 * remove_block_instance: Remove uma instância física de bloco do HTML gerado.
 *
 * Estratégia V1:
 * 1. Procura marcadores TEMPLATE:OPTIONAL com o instanceId
 * 2. Remove tudo entre o marcador de abertura e fechamento (inclusive)
 * 3. Fallback: Se não houver marcadores OPTIONAL, remove a tag com data-template-block-instance
 */
export function applyRemoveBlockInstance(ctx: TransformContext, op: GenerationOperation): void {
  const instanceId = op.target;
  const instance = ctx.template.blockInstances.find((bi) => bi.instanceId === instanceId);

  if (!instance) {
    ctx.warnings.push(
      `remove_block_instance: Instância "${instanceId}" não encontrada nos metadados`,
    );
    return;
  }

  const templateFilePath = path.join(ctx.outputProjectDir, instance.templateFile);

  let content: string;
  try {
    content = readFile(templateFilePath);
  } catch {
    // O template pode não existir na variante (step removido)
    // Não é erro, apenas skip silencioso
    return;
  }

  // Estratégia 1: Marcadores TEMPLATE:OPTIONAL
  const escapedInstanceId = escapeRegex(instanceId);
  const optionalPattern = new RegExp(
    `[ \\t]*<!-- TEMPLATE:OPTIONAL[^>]*instance="${escapedInstanceId}"[^>]*-->` +
    `[\\s\\S]*?` +
    `<!-- \\/TEMPLATE:OPTIONAL -->[ \\t]*\\n?`,
    'g',
  );

  let newContent = content.replace(optionalPattern, '');

  if (newContent !== content) {
    writeFile(templateFilePath, newContent);
    ctx.filesModified.add(instance.templateFile);
    return;
  }

  // Estratégia 2: Fallback — remover tag com data-template-block-instance
  const tagPattern = new RegExp(
    `[ \\t]*<[a-z-]+[^>]*data-template-block-instance="${escapedInstanceId}"[^>]*(?:\\/>|>[\\s\\S]*?<\\/[a-z-]+>)[ \\t]*\\n?`,
    'g',
  );

  newContent = content.replace(tagPattern, '');

  if (newContent !== content) {
    writeFile(templateFilePath, newContent);
    ctx.filesModified.add(instance.templateFile);
    return;
  }

  ctx.warnings.push(
    `remove_block_instance: Não foi possível localizar instância "${instanceId}" em "${instance.templateFile}"`,
  );
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
