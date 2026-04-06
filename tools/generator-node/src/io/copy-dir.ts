import * as fs from 'node:fs';

/**
 * Copia um diretório recursivamente.
 * Se o destino já existir, remove antes de copiar.
 */
export function copyDir(src: string, dest: string): void {
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true });
  }
  fs.cpSync(src, dest, { recursive: true });
}
