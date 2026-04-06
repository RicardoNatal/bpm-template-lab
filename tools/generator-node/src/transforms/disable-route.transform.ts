import * as path from 'node:path';
import type { GenerationOperation } from '../types/generator.types.js';
import type { TransformContext } from '../core/apply-generation-plan.js';
import { readFile, writeFile } from '../io/index.js';

/**
 * disable_route: Remove a entrada de rota correspondente ao stepId em app-routing.module.ts.
 *
 * Estratégia V1: busca por linha contendo STEP_ROUTE_MAP['<stepId>'],
 * caminha para trás até o `{` de abertura (incluindo comentários acima),
 * caminha para frente até o `},` de fechamento, e remove o bloco inteiro.
 */
export function applyDisableRoute(ctx: TransformContext, op: GenerationOperation): void {
  const stepId = op.target;
  const routingFilePath = path.join(ctx.outputProjectDir, 'src', 'app', 'app-routing.module.ts');

  let content: string;
  try {
    content = readFile(routingFilePath);
  } catch {
    ctx.warnings.push(`disable_route: app-routing.module.ts não encontrado em ${routingFilePath}`);
    return;
  }

  const lines = content.split('\n');
  const marker = `STEP_ROUTE_MAP['${stepId}']`;

  // Encontrar a linha que contém o marker
  const markerLineIdx = lines.findIndex((line) => line.includes(marker));
  if (markerLineIdx === -1) {
    ctx.warnings.push(
      `disable_route: Não foi possível localizar "${marker}" em app-routing.module.ts`,
    );
    return;
  }

  // Caminhar para trás até encontrar a abertura do bloco `{`
  let startIdx = markerLineIdx;
  while (startIdx > 0) {
    const trimmed = lines[startIdx].trim();
    if (trimmed.startsWith('{') || trimmed === '{') {
      break;
    }
    startIdx--;
  }

  // Incluir comentários imediatamente acima do `{`
  while (startIdx > 0 && lines[startIdx - 1].trim().startsWith('//')) {
    startIdx--;
  }

  // Caminhar para frente até encontrar o fechamento `},`
  let endIdx = markerLineIdx;
  while (endIdx < lines.length - 1) {
    const trimmed = lines[endIdx].trim();
    if (trimmed === '},' || trimmed === '},') {
      break;
    }
    endIdx++;
  }

  // Remover as linhas do bloco (inclusive)
  lines.splice(startIdx, endIdx - startIdx + 1);

  writeFile(routingFilePath, lines.join('\n'));
  ctx.filesModified.add('src/app/app-routing.module.ts');
}
