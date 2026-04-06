import * as path from 'node:path';
import * as fs from 'node:fs';
import type { InferredComponent } from '../types/meta-source.types.js';

/**
 * Tenta inferir componentes Angular a partir do projeto copiado.
 *
 * Estratégia simples:
 * 1. Encontra arquivos .component.ts
 * 2. Extrai nome da classe e selector
 * 3. Localiza o .component.html correspondente
 *
 * Resultado é para scaffold inicial — revisão manual obrigatória.
 */
export function inferComponents(projectDir: string): InferredComponent[] {
  const components: InferredComponent[] = [];
  const tsFiles = findFilesByExtension(projectDir, '.component.ts');

  for (const tsFile of tsFiles) {
    const content = fs.readFileSync(tsFile, 'utf-8');

    // Extract class name
    const classMatch = content.match(/export\s+class\s+(\w+Component)/);
    if (!classMatch) continue;

    const name = classMatch[1];

    // Extract selector
    const selectorMatch = content.match(/selector\s*:\s*['"]([^'"]+)['"]/);
    const selector = selectorMatch?.[1];

    // Find corresponding HTML
    const htmlPath = tsFile.replace(/\.component\.ts$/, '.component.html');
    const htmlRelPath = path.relative(projectDir, htmlPath).replace(/\\/g, '/');

    if (fs.existsSync(htmlPath)) {
      components.push({
        name,
        selector,
        templateFile: htmlRelPath,
        htmlPath: htmlRelPath,
      });
    } else {
      // Check inline template
      const inlineTemplate = content.match(/template\s*:\s*`/);
      if (inlineTemplate) {
        components.push({
          name,
          selector,
          htmlPath: path.relative(projectDir, tsFile).replace(/\\/g, '/') + ' (inline)',
        });
      }
    }
  }

  return components;
}

/**
 * Lista todos os .component.html encontrados no projeto.
 */
export function findHtmlFiles(projectDir: string): string[] {
  const files = findFilesByExtension(projectDir, '.component.html');
  return files.map((f) => path.relative(projectDir, f).replace(/\\/g, '/'));
}

function findFilesByExtension(dir: string, ext: string, results: string[] = []): string[] {
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
      findFilesByExtension(fullPath, ext, results);
    } else if (entry.name.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}
