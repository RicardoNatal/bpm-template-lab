import * as fs from 'node:fs';
import * as path from 'node:path';
import { CATALOG_SCHEMA } from './catalog-schema.js';

// Tipos do catálogo (re-declarados localmente para evitar acoplamento de build
// entre packages sem workspace manager. Fonte canônica: shared-types/src/catalog.types.ts)
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
// Leitura
// ---------------------------------------------------------------------------

/**
 * Lê o catalog.json do diretório registry-data.
 * Retorna null se o arquivo não existir.
 */
export function readCatalog(registryDataDir: string): RegistryCatalog | null {
  const catalogPath = path.join(registryDataDir, 'catalog.json');
  if (!fs.existsSync(catalogPath)) return null;
  const raw = fs.readFileSync(catalogPath, 'utf-8');
  return JSON.parse(raw) as RegistryCatalog;
}

/**
 * Lista todas as categorias do catálogo.
 */
export function listCategories(catalog: RegistryCatalog): BpmCategory[] {
  return catalog.bpmCategories;
}

/**
 * Lista todos os modelos de uma categoria específica.
 */
export function listModels(catalog: RegistryCatalog, categoryId: string): PublishedModel[] {
  const category = catalog.bpmCategories.find(c => c.id === categoryId);
  return category?.models ?? [];
}

/**
 * Busca um modelo específico pelo slug.
 */
export function findModel(catalog: RegistryCatalog, slug: string): PublishedModel | undefined {
  for (const cat of catalog.bpmCategories) {
    const model = cat.models.find(m => m.slug === slug);
    if (model) return model;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Validação
// ---------------------------------------------------------------------------

export interface CatalogValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    categoriesCount: number;
    modelsCount: number;
  };
}

/**
 * Valida a estrutura do catalog.json.
 */
export function validateCatalog(catalog: unknown): CatalogValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!catalog || typeof catalog !== 'object') {
    return { valid: false, errors: ['Catálogo não é um objeto válido'], warnings, stats: { categoriesCount: 0, modelsCount: 0 } };
  }

  const cat = catalog as Record<string, unknown>;

  // Verificar campos obrigatórios do topo
  for (const field of CATALOG_SCHEMA.requiredTopLevel) {
    if (!(field in cat)) {
      errors.push(`Campo obrigatório ausente: ${field}`);
    }
  }

  if (!Array.isArray(cat.bpmCategories)) {
    errors.push('bpmCategories deve ser um array');
    return { valid: errors.length === 0, errors, warnings, stats: { categoriesCount: 0, modelsCount: 0 } };
  }

  let modelsCount = 0;

  for (const category of cat.bpmCategories as Record<string, unknown>[]) {
    // Verificar campos da categoria
    for (const field of CATALOG_SCHEMA.requiredCategory) {
      if (!(field in category)) {
        errors.push(`Categoria "${category.id ?? '?'}": campo obrigatório ausente: ${field}`);
      }
    }

    if (!Array.isArray(category.models)) continue;

    const slugs = new Set<string>();
    for (const model of category.models as Record<string, unknown>[]) {
      // Verificar campos do modelo
      for (const field of CATALOG_SCHEMA.requiredModel) {
        if (!(field in model)) {
          errors.push(`Modelo "${model.slug ?? '?'}": campo obrigatório ausente: ${field}`);
        }
      }

      // Verificar slug duplicado
      if (typeof model.slug === 'string') {
        if (slugs.has(model.slug)) {
          errors.push(`Slug duplicado: ${model.slug}`);
        }
        slugs.add(model.slug);
      }

      modelsCount++;
    }
  }

  if (modelsCount === 0) {
    warnings.push('Catálogo não contém nenhum modelo publicado');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      categoriesCount: (cat.bpmCategories as unknown[]).length,
      modelsCount,
    },
  };
}

// ---------------------------------------------------------------------------
// Escrita
// ---------------------------------------------------------------------------

/**
 * Salva o catálogo no disco.
 */
export function writeCatalog(registryDataDir: string, catalog: RegistryCatalog): void {
  const catalogPath = path.join(registryDataDir, 'catalog.json');
  if (!fs.existsSync(registryDataDir)) {
    fs.mkdirSync(registryDataDir, { recursive: true });
  }
  catalog.updatedAt = new Date().toISOString();
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n', 'utf-8');
}

/**
 * Adiciona ou atualiza um modelo no catálogo.
 * Cria a categoria se não existir.
 */
export function upsertModel(
  catalog: RegistryCatalog,
  categoryId: string,
  categoryName: string,
  categoryDescription: string,
  model: PublishedModel,
): void {
  let category = catalog.bpmCategories.find(c => c.id === categoryId);
  if (!category) {
    category = { id: categoryId, name: categoryName, description: categoryDescription, models: [] };
    catalog.bpmCategories.push(category);
  }

  const existingIdx = category.models.findIndex(m => m.slug === model.slug);
  if (existingIdx >= 0) {
    category.models[existingIdx] = model;
  } else {
    category.models.push(model);
  }

  category.models.sort((a, b) => a.slug.localeCompare(b.slug));
}

/**
 * Cria um catálogo vazio.
 */
export function createEmptyCatalog(): RegistryCatalog {
  return {
    version: '1.0',
    updatedAt: new Date().toISOString(),
    bpmCategories: [],
  };
}
