import * as path from 'node:path';
import * as fs from 'node:fs';
import type { InferredRoute } from '../types/meta-source.types.js';

/**
 * Tenta inferir rotas a partir do projeto Angular copiado.
 *
 * Estratégias (simples, sem AST):
 * 1. Procura arquivos *-routing.module.ts ou app-routing.module.ts
 * 2. Busca por padrões de loadChildren / path em route configs
 * 3. Retorna lista de rotas candidatas
 *
 * Não garante precisão — resultado é para scaffold inicial.
 */
export function inferRoutes(projectDir: string): InferredRoute[] {
  const routes: InferredRoute[] = [];
  const routingFiles = findFilesByPattern(projectDir, /-routing\.module\.ts$|app-routing\.module\.ts$/);

  for (const file of routingFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const parsed = extractRoutesFromContent(content);
    routes.push(...parsed);
  }

  // Fallback: look for route definitions in any module file
  if (routes.length === 0) {
    const moduleFiles = findFilesByPattern(projectDir, /\.module\.ts$/);
    for (const file of moduleFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('RouterModule') || content.includes('loadChildren')) {
        const parsed = extractRoutesFromContent(content);
        routes.push(...parsed);
      }
    }
  }

  // Deduplicate by path
  const seen = new Set<string>();
  return routes.filter((r) => {
    if (seen.has(r.path)) return false;
    seen.add(r.path);
    return true;
  });
}

function extractRoutesFromContent(content: string): InferredRoute[] {
  const routes: InferredRoute[] = [];

  // Pattern: { path: 'xxx', loadChildren: () => import('./yyy').then(m => m.ZzzModule) }
  const loadChildrenRegex = /path\s*:\s*['"]([^'"]+)['"]\s*,\s*loadChildren\s*:\s*\(\)\s*=>\s*import\s*\(\s*['"]([^'"]+)['"]\s*\)\.then\s*\(\s*\w+\s*=>\s*\w+\.(\w+)\s*\)/g;

  let match: RegExpExecArray | null;
  while ((match = loadChildrenRegex.exec(content)) !== null) {
    if (match[1] !== '**') {
      routes.push({
        path: match[1],
        modulePath: match[2],
        moduleName: match[3],
      });
    }
  }

  // Pattern: { path: 'xxx', component: YyyComponent }
  const componentRegex = /path\s*:\s*['"]([^'"]+)['"]\s*,\s*component\s*:\s*(\w+)/g;
  while ((match = componentRegex.exec(content)) !== null) {
    if (match[1] !== '**') {
      routes.push({
        path: match[1],
        componentName: match[2],
      });
    }
  }

  // Simpler pattern: just path definitions
  const simplePathRegex = /path\s*:\s*['"]([^'"*]+)['"]/g;
  const existingPaths = new Set(routes.map((r) => r.path));
  while ((match = simplePathRegex.exec(content)) !== null) {
    const p = match[1];
    if (p && !existingPaths.has(p) && p !== '' && p !== '**') {
      routes.push({ path: p });
      existingPaths.add(p);
    }
  }

  return routes;
}

function findFilesByPattern(dir: string, pattern: RegExp, results: string[] = []): string[] {
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
      findFilesByPattern(fullPath, pattern, results);
    } else if (pattern.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}
