import * as path from 'node:path';
import { writeJson } from '../io/index.js';
import { ensureDir } from '../io/ensure-dir.js';
import type { LoadedMetaSource } from '../types/meta-source.types.js';

/**
 * Serializa os dados carregados do meta-source em arquivos JSON individuais
 * no diretório meta/ do template.
 *
 * Gera:
 * - manifest.json (com seção files apontando para os outros JSONs)
 * - steps.json
 * - routes.json (com maps derivados)
 * - presets.json
 * - blocks.json
 * - block-instances.json
 * - field-schemas.json
 * - process-variables.json
 * - dependencies.json
 */
export function serializeMeta(metaDir: string, data: LoadedMetaSource): string[] {
  ensureDir(metaDir);

  const written: string[] = [];

  // steps.json
  writeJson(path.join(metaDir, 'steps.json'), data.steps);
  written.push('steps.json');

  // routes.json — formato com maps derivados
  const routesMeta = buildRoutesMeta(data.routes);
  writeJson(path.join(metaDir, 'routes.json'), routesMeta);
  written.push('routes.json');

  // presets.json
  writeJson(path.join(metaDir, 'presets.json'), data.presets);
  written.push('presets.json');

  // blocks.json
  writeJson(path.join(metaDir, 'blocks.json'), data.blocks);
  written.push('blocks.json');

  // block-instances.json
  writeJson(path.join(metaDir, 'block-instances.json'), data.blockInstances);
  written.push('block-instances.json');

  // field-schemas.json
  writeJson(path.join(metaDir, 'field-schemas.json'), data.fieldSchemas);
  written.push('field-schemas.json');

  // process-variables.json
  writeJson(path.join(metaDir, 'process-variables.json'), data.processVariables);
  written.push('process-variables.json');

  // dependencies.json
  writeJson(path.join(metaDir, 'dependencies.json'), data.dependencies);
  written.push('dependencies.json');

  // manifest.json — entrypoint principal
  const manifestJson = buildManifestJson(data);
  writeJson(path.join(metaDir, 'manifest.json'), manifestJson);
  written.push('manifest.json');

  return written;
}

function buildRoutesMeta(routes: unknown[]): Record<string, unknown> {
  const stepRouteMap: Record<string, string> = {};
  const routeStepMap: Record<string, string> = {};

  for (const route of routes) {
    const r = route as { stepId?: string; path?: string };
    if (r.stepId && r.path) {
      stepRouteMap[r.stepId] = r.path;
      routeStepMap[r.path] = r.stepId;
    }
  }

  return {
    routes,
    stepRouteMap,
    routeStepMap,
  };
}

function buildManifestJson(data: LoadedMetaSource): Record<string, unknown> {
  const manifest = data.manifest;

  // Extrair campos top-level que vão para o manifest.json
  // Excluir as seções de dados que vão para arquivos separados
  const {
    steps: _s,
    routes: _r,
    presets: _p,
    blocks: _b,
    blockInstances: _bi,
    fieldSchemas: _fs,
    processVariables: _pv,
    dependencies: _d,
    ...rest
  } = manifest;

  return {
    ...rest,
    files: {
      steps: 'steps.json',
      routes: 'routes.json',
      presets: 'presets.json',
      blocks: 'blocks.json',
      blockInstances: 'block-instances.json',
      fieldSchemas: 'field-schemas.json',
      processVariables: 'process-variables.json',
      dependencies: 'dependencies.json',
    },
  };
}
