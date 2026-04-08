import * as path from 'node:path';
import * as fs from 'node:fs';
import { readJson } from '../io/index.js';
import type {
  LoadedTemplate,
  TemplateManifest,
  StepMeta,
  RoutesMeta,
  PresetMeta,
  BlockMeta,
  BlockInstanceMeta,
  FieldSchemaMeta,
  ProcessVariableMeta,
  DependencyMeta,
} from '../types/generator.types.js';

/**
 * Carrega todos os metadados de um template a partir de meta/manifest.json.
 *
 * @param templatesDir  Caminho absoluto para a pasta templates/ do repositório
 * @param templateId    ID da pasta do template (ex: "va-vr-base")
 */
export function loadTemplate(templatesDir: string, templateId: string): LoadedTemplate {
  const templateDir = path.join(templatesDir, templateId);
  const metaDir = path.join(templateDir, 'meta');
  const projectDir = path.join(templateDir, 'project');

  if (!fs.existsSync(metaDir)) {
    throw new Error(`Diretório meta/ não encontrado: ${metaDir}`);
  }
  if (!fs.existsSync(projectDir)) {
    throw new Error(`Diretório project/ não encontrado: ${projectDir}`);
  }

  const manifestPath = path.join(metaDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`manifest.json não encontrado: ${manifestPath}`);
  }

  const manifest = readJson<TemplateManifest>(manifestPath);

  const loadMetaFile = <T>(fileName: string): T => {
    const filePath = path.join(metaDir, fileName);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo de metadados não encontrado: ${filePath} (referenciado em manifest.files)`);
    }
    return readJson<T>(filePath);
  };

  return {
    manifest,
    steps: loadMetaFile<StepMeta[]>(manifest.files.steps),
    routes: loadMetaFile<RoutesMeta>(manifest.files.routes),
    presets: loadMetaFile<PresetMeta[]>(manifest.files.presets),
    blocks: loadMetaFile<BlockMeta[]>(manifest.files.blocks),
    blockInstances: loadMetaFile<BlockInstanceMeta[]>(manifest.files.blockInstances),
    fieldSchemas: loadMetaFile<FieldSchemaMeta[]>(manifest.files.fieldSchemas),
    processVariables: loadMetaFile<ProcessVariableMeta[]>(manifest.files.processVariables),
    dependencies: loadMetaFile<DependencyMeta[]>(manifest.files.dependencies),
    metaDir,
    projectDir,
  };
}
