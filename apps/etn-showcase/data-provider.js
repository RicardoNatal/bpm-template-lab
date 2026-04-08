/**
 * Camada de acesso a dados do Showcase.
 *
 * Hoje lê de um arquivo JSON local (registry-data/catalog.json).
 * No futuro, pode ser trocado por API REST sem alterar a UI.
 *
 * Uso:
 *   import { loadCatalog } from './data-provider.js';
 *   const catalog = await loadCatalog();
 */

// Estratégia de resolução do catálogo, em ordem de prioridade:
// 1. Se existir variável global BPM_CATALOG_URL, usa ela (permite override)
// 2. Senão, tenta o caminho relativo padrão do monorepo
const CATALOG_SOURCES = [
  '../../registry-data/catalog.json',
];

/**
 * Carrega o catálogo de modelos BPM.
 * Tenta as fontes configuradas em sequência.
 * @returns {Promise<object>} O catálogo parseado
 * @throws {Error} Se nenhuma fonte retornar dados válidos
 */
async function loadCatalog() {
  // Override global (para futuro uso com API)
  if (typeof window !== 'undefined' && window.BPM_CATALOG_URL) {
    return fetchCatalog(window.BPM_CATALOG_URL);
  }

  const errors = [];
  for (const source of CATALOG_SOURCES) {
    try {
      return await fetchCatalog(source);
    } catch (err) {
      errors.push(`${source}: ${err.message}`);
    }
  }

  throw new Error(
    'Não foi possível carregar o catálogo.\nFontes tentadas:\n' +
    errors.map(e => '  - ' + e).join('\n')
  );
}

/**
 * Busca e parseia o catálogo de uma URL.
 */
async function fetchCatalog(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

/**
 * Lista as categorias do catálogo.
 */
function listCategories(catalog) {
  return catalog.bpmCategories || [];
}

/**
 * Lista modelos de uma categoria.
 */
function listModels(catalog, categoryId) {
  const cat = (catalog.bpmCategories || []).find(c => c.id === categoryId);
  return cat ? cat.models || [] : [];
}

/**
 * Busca um modelo pelo slug.
 */
function findModel(catalog, slug) {
  for (const cat of catalog.bpmCategories || []) {
    const model = (cat.models || []).find(m => m.slug === slug);
    if (model) return model;
  }
  return null;
}

// Expor no escopo global para uso direto em <script> tags
if (typeof window !== 'undefined') {
  window.CatalogProvider = {
    loadCatalog,
    listCategories,
    listModels,
    findModel,
  };
}
