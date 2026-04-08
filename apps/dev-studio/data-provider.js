/**
 * Camada de acesso a dados do Dev Studio.
 *
 * Lê templates, presets e catálogo.
 * No futuro, pode ser substituída por API sem alterar a UI.
 */

const TEMPLATES_INDEX_PATH = '../../templates';
const REGISTRY_DATA_PATH = '../../registry-data';
const PLAYGROUND_PATH = '../../playground/requests';
const GENERATOR_CWD = '../../packages/generator-core';

/**
 * Descobre os templates disponíveis lendo templates/index.json.
 * @returns {Promise<string[]>} Lista de IDs de template
 */
async function discoverTemplates() {
  return fetchJson(`${TEMPLATES_INDEX_PATH}/index.json`);
}

/**
 * Carrega os metadados de um template.
 */
async function loadTemplateMeta(templateId) {
  const basePath = `${TEMPLATES_INDEX_PATH}/${templateId}/meta`;
  const [manifest, steps, presets, blocks] = await Promise.all([
    fetchJson(`${basePath}/manifest.json`),
    fetchJson(`${basePath}/steps.json`),
    fetchJson(`${basePath}/presets.json`),
    fetchJson(`${basePath}/blocks.json`),
  ]);

  let workflows = null;
  try {
    workflows = await fetchJson(`${basePath}/workflows.json`);
  } catch (_) { /* workflows.json é opcional */ }

  return { manifest, steps, presets, blocks, workflows };
}

/**
 * Carrega todos os templates conhecidos.
 */
async function loadAllTemplates() {
  const templateIds = await discoverTemplates();
  const templates = [];
  for (const id of templateIds) {
    try {
      const meta = await loadTemplateMeta(id);
      templates.push({ id, ...meta });
    } catch (err) {
      console.warn(`Template "${id}" não carregou: ${err.message}`);
    }
  }
  return templates;
}

/**
 * Carrega o catálogo publicado.
 */
async function loadCatalog() {
  return fetchJson(`${REGISTRY_DATA_PATH}/catalog.json`);
}

/**
 * Carrega um request de exemplo do playground.
 */
async function loadPlaygroundRequest(filename) {
  return fetchJson(`${PLAYGROUND_PATH}/${filename}`);
}

/**
 * Lista os requests de exemplo disponíveis.
 * Carrega dinamicamente de playground/requests/index.json.
 * @returns {Promise<Array<{filename: string, label: string}>>}
 */
async function getPlaygroundRequests() {
  return fetchJson(`${PLAYGROUND_PATH}/index.json`);
}

async function fetchJson(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status} ao buscar ${url}`);
  return resp.json();
}

if (typeof window !== 'undefined') {
  window.DevStudioData = {
    loadTemplateMeta,
    loadAllTemplates,
    loadCatalog,
    loadPlaygroundRequest,
    getPlaygroundRequests,
    discoverTemplates,
    GENERATOR_CWD,
  };
}
