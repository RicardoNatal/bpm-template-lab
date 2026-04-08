import * as fs from 'node:fs';
import * as path from 'node:path';

/** Diretórios ignorados durante a cópia do projeto base */
const IGNORED_DIRS = new Set(['node_modules', '.angular', '.git', 'dist']);

/**
 * Copia um diretório recursivamente.
 * Se o destino já existir, remove antes de copiar.
 * Ignora node_modules, .angular, .git e dist por padrão.
 */
export function copyDir(src: string, dest: string): void {
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true });
  }
  fs.cpSync(src, dest, {
    recursive: true,
    filter: (source: string) => {
      const basename = path.basename(source);
      return !IGNORED_DIRS.has(basename);
    },
  });
}
