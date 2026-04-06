import * as fs from 'node:fs';

export function writeFile(filePath: string, content: string): void {
  fs.writeFileSync(filePath, content, 'utf-8');
}
