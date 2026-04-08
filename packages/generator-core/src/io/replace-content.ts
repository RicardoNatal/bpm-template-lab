import { readFile } from './read-file.js';
import { writeFile } from './write-file.js';

/**
 * Substitui todas as ocorrências de `search` por `replacement` no arquivo.
 * Retorna true se pelo menos uma substituição foi feita.
 */
export function replaceContent(filePath: string, search: string | RegExp, replacement: string): boolean {
  const original = readFile(filePath);
  const updated = typeof search === 'string'
    ? original.replaceAll(search, replacement)
    : original.replace(search, replacement);

  if (updated !== original) {
    writeFile(filePath, updated);
    return true;
  }
  return false;
}
