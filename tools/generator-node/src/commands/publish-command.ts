import * as path from 'node:path';
import * as fs from 'node:fs';
import { readJson, writeJson, ensureDir } from '../io/index.js';
import type {
  GenerationReport,
  TemplateManifest,
  StepMeta,
  PresetMeta,
  BlockMeta,
  FeatureMeta,
} from '../types/generator.types.js';

// ---------------------------------------------------------------------------
// Tipos do Registry
// ---------------------------------------------------------------------------

export interface RegistryCatalog {
  version: '1.0';
  updatedAt: string;
  bpmCategories: BpmCategory[];
}

export interface BpmCategory {
  id: string;
  name: string;
  description: string;
  models: PublishedModel[];
}

export interface PublishedModel {
  slug: string;
  name: string;
  presetId: string;
  presetLabel: string;
  presetDescription: string;
  templateId: string;
  version: string;
  publishedAt: string;
  aiGenerated: boolean;
  steps: { id: string; label: string; enabled: boolean }[];
  features: { id: string; label: string; enabled: boolean }[];
  blocks: { id: string; label: string; enabled: boolean }[];
  operationsCount: number;
  operations: { type: string; target: string }[];
  workflow: unknown | null;
  metaPath: string;
  outputPath: string;
}

// ---------------------------------------------------------------------------
// Comando publish
// ---------------------------------------------------------------------------

export function runPublish(slug: string, repoRoot: string): void {
  const outputDir = path.join(repoRoot, 'output', slug);
  const registryDir = path.join(repoRoot, 'registry');
  const catalogPath = path.join(registryDir, 'catalog.json');

  // Validar que o output existe
  if (!fs.existsSync(outputDir)) {
    throw new Error(`Output não encontrado: ${outputDir}\nExecute "generate" primeiro.`);
  }

  const metaDir = path.join(outputDir, '_meta');
  const reportPath = path.join(outputDir, '_generation-report.json');

  if (!fs.existsSync(metaDir)) {
    throw new Error(`Diretório _meta/ não encontrado em ${outputDir}`);
  }
  if (!fs.existsSync(reportPath)) {
    throw new Error(`Arquivo _generation-report.json não encontrado em ${outputDir}`);
  }

  // Ler metadados do modelo gerado
  const report = readJson<GenerationReport>(reportPath);
  const manifest = readJson<TemplateManifest>(path.join(metaDir, 'manifest.json'));
  const steps = readJson<StepMeta[]>(path.join(metaDir, 'steps.json'));
  const presets = readJson<PresetMeta[]>(path.join(metaDir, 'presets.json'));
  const blocks = readJson<BlockMeta[]>(path.join(metaDir, 'blocks.json'));

  // Ler steps e blocos do template base para comparação (modelo completo)
  const baseMetaDir = path.join(repoRoot, 'templates', report.templateId, 'meta');
  let baseSteps: StepMeta[] = [];
  let baseBlocks: BlockMeta[] = [];
  let baseFeatures: FeatureMeta[] = [];
  let baseManifest: TemplateManifest | null = null;

  if (fs.existsSync(baseMetaDir)) {
    baseManifest = readJson<TemplateManifest>(path.join(baseMetaDir, 'manifest.json'));
    baseSteps = readJson<StepMeta[]>(path.join(baseMetaDir, 'steps.json'));
    baseBlocks = readJson<BlockMeta[]>(path.join(baseMetaDir, 'blocks.json'));
    baseFeatures = baseManifest.features ?? [];
  }

  // Determinar preset utilizado
  const preset = presets.find(p => p.id === report.presetId);
  const enabledStepIds = new Set(steps.map(s => s.id));
  const enabledBlockIds = new Set(blocks.map(b => b.id));
  const enabledFeatureIds = new Set(manifest.features.map(f => f.id));

  // Detectar se foi gerado com IA (modelos com operações sugerem customização via IA)
  const aiGenerated = report.operationsExecuted.length > 0;

  // Ler workflow BPMN do template (se disponível)
  let workflow: unknown | null = null;
  const workflowsPath = path.join(baseMetaDir, 'workflows.json');
  if (fs.existsSync(workflowsPath)) {
    const workflows = readJson<Record<string, unknown>>(workflowsPath);
    workflow = workflows[report.presetId] ?? null;
  }

  // Construir entrada do modelo
  const model: PublishedModel = {
    slug,
    name: report.projectName,
    presetId: report.presetId,
    presetLabel: preset?.label ?? report.presetId,
    presetDescription: preset?.description ?? '',
    templateId: report.templateId,
    version: manifest.version,
    publishedAt: new Date().toISOString(),
    aiGenerated,
    steps: (baseSteps.length > 0 ? baseSteps : steps).map(s => ({
      id: s.id,
      label: s.label,
      enabled: enabledStepIds.has(s.id),
    })),
    features: (baseFeatures.length > 0 ? baseFeatures : manifest.features).map(f => ({
      id: f.id,
      label: f.label ?? f.id,
      enabled: enabledFeatureIds.has(f.id),
    })),
    blocks: (baseBlocks.length > 0 ? baseBlocks : blocks).map(b => ({
      id: b.id,
      label: b.label,
      enabled: enabledBlockIds.has(b.id),
    })),
    operationsCount: report.operationsExecuted.length,
    operations: report.operationsExecuted.map(op => ({
      type: op.type,
      target: op.target,
    })),
    workflow,
    metaPath: `models/${slug}/_meta`,
    outputPath: `../../output/${slug}`,
  };

  // Copiar _meta para o registry
  const registryModelDir = path.join(registryDir, 'models', slug);
  const registryMetaDir = path.join(registryModelDir, '_meta');
  ensureDir(registryMetaDir);

  // Copiar todos os arquivos de _meta/
  for (const file of fs.readdirSync(metaDir)) {
    const src = path.join(metaDir, file);
    const dest = path.join(registryMetaDir, file);
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, dest);
    }
  }

  // Copiar o relatório de geração
  fs.copyFileSync(reportPath, path.join(registryModelDir, '_generation-report.json'));

  // Atualizar o catálogo
  let catalog: RegistryCatalog;
  if (fs.existsSync(catalogPath)) {
    catalog = readJson<RegistryCatalog>(catalogPath);
  } else {
    ensureDir(registryDir);
    catalog = {
      version: '1.0',
      updatedAt: new Date().toISOString(),
      bpmCategories: [],
    };
  }

  // Encontrar ou criar a categoria baseada no templateId
  const categoryId = report.templateId;
  let category = catalog.bpmCategories.find(c => c.id === categoryId);
  if (!category) {
    category = {
      id: categoryId,
      name: manifest.name ?? categoryId,
      description: manifest.description ?? '',
      models: [],
    };
    catalog.bpmCategories.push(category);
  }

  // Substituir modelo se já publicado, ou adicionar novo
  const existingIdx = category.models.findIndex(m => m.slug === slug);
  if (existingIdx >= 0) {
    category.models[existingIdx] = model;
    console.log(`🔄 Modelo "${slug}" atualizado no catálogo.`);
  } else {
    category.models.push(model);
    console.log(`✅ Modelo "${slug}" adicionado ao catálogo.`);
  }

  // Ordenar modelos por nome
  category.models.sort((a, b) => a.slug.localeCompare(b.slug));

  catalog.updatedAt = new Date().toISOString();
  writeJson(catalogPath, catalog);

  // Resumo                              
  console.log('\n' + '═'.repeat(60));
  console.log('📦 MODELO PUBLICADO NO REGISTRY');
  console.log('═'.repeat(60));
  console.log(`  Slug:       ${model.slug}`);
  console.log(`  Nome:       ${model.name}`);
  console.log(`  Preset:     ${model.presetLabel}`);
  console.log(`  Template:   ${model.templateId}`);
  console.log(`  Etapas:     ${model.steps.filter(s => s.enabled).length}/${model.steps.length}`);
  console.log(`  Features:   ${model.features.filter(f => f.enabled).length}/${model.features.length}`);
  console.log(`  IA:         ${model.aiGenerated ? 'Sim' : 'Não'}`);
  console.log(`  Registry:   ${registryModelDir}`);
  console.log(`  Catálogo:   ${catalogPath}`);
  console.log('═'.repeat(60) + '\n');
}
