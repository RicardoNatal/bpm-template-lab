import * as path from 'node:path';
import * as fs from 'node:fs';
import { execSync } from 'node:child_process';
import type { LoadedMetaSource } from '../types/meta-source.types.js';

/**
 * Carrega o meta-source de um template resolvendo as exportações TypeScript.
 *
 * Usa tsx via subprocesso para importar o manifest.ts que compõe todos os outros
 * arquivos de configuração. Isso funciona porque:
 * 1. O manifest.ts importa e reexporta todas as configs
 * 2. tsx resolve TypeScript nativamente
 * 3. O output é JSON puro, sem dependências de runtime
 */
export function loadMetaSource(metaSourceDir: string): LoadedMetaSource {
  const manifestPath = path.join(metaSourceDir, 'workflow-template.manifest.ts');

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest não encontrado: ${manifestPath}`);
  }

  // Criar script temporário no mesmo diretório para resolver imports relativos
  const loaderPath = path.join(metaSourceDir, '__sync-loader.tmp.ts');
  const loaderContent = `import { WORKFLOW_TEMPLATE_MANIFEST } from './workflow-template.manifest';
process.stdout.write(JSON.stringify(WORKFLOW_TEMPLATE_MANIFEST));
`;

  fs.writeFileSync(loaderPath, loaderContent, 'utf-8');

  try {
    const result = execSync(`npx tsx "${loaderPath}"`, {
      cwd: metaSourceDir,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 30000,
    });

    const manifest = JSON.parse(result) as Record<string, unknown>;
    return extractMetaSource(manifest);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Falha ao carregar meta-source. Verifique se os arquivos TypeScript estão válidos.\n` +
      `Diretório: ${metaSourceDir}\n` +
      `Erro: ${msg}`,
    );
  } finally {
    // Limpar arquivo temporário
    if (fs.existsSync(loaderPath)) {
      fs.unlinkSync(loaderPath);
    }
  }
}

function extractMetaSource(manifest: Record<string, unknown>): LoadedMetaSource {
  return {
    manifest,
    steps: asArray(manifest['steps']),
    routes: asArray(manifest['routes']),
    presets: asArray(manifest['presets']),
    blocks: asArray(manifest['blocks']),
    blockInstances: asArray(manifest['blockInstances']),
    fieldSchemas: asArray(manifest['fieldSchemas']),
    processVariables: asArray(manifest['processVariables']),
    dependencies: asArray(manifest['dependencies']),
    features: asArray(manifest['features']),
  };
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}
