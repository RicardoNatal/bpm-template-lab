import * as path from 'node:path';
import * as fs from 'node:fs';

/**
 * Contexto coletado do projeto Angular e do template de referência VA/VR.
 * Usado para montar o prompt da OpenAI.
 */
export interface BootstrapContext {
  /** templateId do novo template */
  templateId: string;
  /** Arquivos relevantes do projeto Angular novo (path relativo → conteúdo) */
  projectFiles: Map<string, string>;
  /** Arquivos do meta-source VA/VR como referência (path relativo → conteúdo) */
  referenceMetaSource: Map<string, string>;
  /** Conteúdo do manifest.json do VA/VR como referência de output */
  referenceManifestJson: string;
}

/**
 * Coleta o contexto necessário para o bootstrap via IA.
 *
 * 1. Arquivos relevantes do projeto Angular novo
 * 2. meta-source do VA/VR como referência estrutural
 * 3. manifest.json do VA/VR como referência do formato de saída
 */
export function collectBootstrapContext(
  templateId: string,
  projectDir: string,
  templatesDir: string,
): BootstrapContext {
  const projectFiles = collectProjectFiles(projectDir);
  const referenceMetaSource = collectReferenceMetaSource(templatesDir);
  const referenceManifestJson = loadReferenceManifestJson(templatesDir);

  return {
    templateId,
    projectFiles,
    referenceMetaSource,
    referenceManifestJson,
  };
}

// ---------------------------------------------------------------------------
// Coleta de arquivos do projeto Angular
// ---------------------------------------------------------------------------

/** Extensões e padrões de arquivos relevantes */
const RELEVANT_PATTERNS = [
  /app-routing\.module\.ts$/,
  /[\\/]modules[\\/].*\.module\.ts$/,
  /[\\/]modules[\\/].*-routing\.module\.ts$/,
  /[\\/]modules[\\/].*\.component\.ts$/,
  /[\\/]modules[\\/].*\.component\.html$/,
  /[\\/]shared[\\/]components[\\/].*\.component\.ts$/,
  /[\\/]shared[\\/]components[\\/].*\.component\.html$/,
  /[\\/]services[\\/].*\.service\.ts$/,
];

/** Tamanho máximo por arquivo para não explodir o contexto */
const MAX_FILE_SIZE = 15_000;

/** Máximo total de caracteres de contexto do projeto */
const MAX_TOTAL_PROJECT_CHARS = 120_000;

function collectProjectFiles(projectDir: string): Map<string, string> {
  const files = new Map<string, string>();
  const srcDir = path.join(projectDir, 'src');

  if (!fs.existsSync(srcDir)) {
    // tentar direto do projectDir
    findRelevantFiles(projectDir, projectDir, files);
  } else {
    findRelevantFiles(srcDir, projectDir, files);
  }

  // Truncar se o total for muito grande
  let totalChars = 0;
  const truncated = new Map<string, string>();

  for (const [relPath, content] of files) {
    if (totalChars + content.length > MAX_TOTAL_PROJECT_CHARS) {
      truncated.set(relPath, content.slice(0, Math.max(0, MAX_TOTAL_PROJECT_CHARS - totalChars)) + '\n// ... [TRUNCATED]');
      break;
    }
    truncated.set(relPath, content);
    totalChars += content.length;
  }

  return truncated;
}

function findRelevantFiles(
  dir: string,
  projectRoot: string,
  result: Map<string, string>,
): void {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (['node_modules', '.git', 'dist', 'e2e', 'assets', 'environments'].includes(entry.name)) continue;
      findRelevantFiles(fullPath, projectRoot, result);
    } else {
      const relPath = path.relative(projectRoot, fullPath).replace(/\\/g, '/');
      const isRelevant = RELEVANT_PATTERNS.some((p) => p.test(fullPath.replace(/\\/g, '/')));

      if (isRelevant) {
        try {
          let content = fs.readFileSync(fullPath, 'utf-8');
          if (content.length > MAX_FILE_SIZE) {
            content = content.slice(0, MAX_FILE_SIZE) + '\n// ... [TRUNCATED]';
          }
          result.set(relPath, content);
        } catch {
          // Ignorar arquivo que não pode ser lido
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Coleta da referência VA/VR
// ---------------------------------------------------------------------------

const REFERENCE_META_SOURCE_FILES = [
  'workflow-template.manifest.ts',
  'workflow-steps.config.ts',
  'workflow-routes.config.ts',
  'workflow-presets.config.ts',
  'ui-blocks.config.ts',
  'ui-block-instances.config.ts',
  'field-schemas.config.ts',
  'process-variables.config.ts',
  'dependencies.config.ts',
];

function collectReferenceMetaSource(templatesDir: string): Map<string, string> {
  const metaSourceDir = path.join(templatesDir, 'va-vr-base', 'meta-source');
  const files = new Map<string, string>();

  if (!fs.existsSync(metaSourceDir)) {
    console.warn('⚠️  Template de referência va-vr-base/meta-source/ não encontrado. IA terá menos contexto.');
    return files;
  }

  for (const fileName of REFERENCE_META_SOURCE_FILES) {
    const filePath = path.join(metaSourceDir, fileName);
    if (fs.existsSync(filePath)) {
      try {
        files.set(fileName, fs.readFileSync(filePath, 'utf-8'));
      } catch {
        // Ignorar
      }
    }
  }

  return files;
}

function loadReferenceManifestJson(templatesDir: string): string {
  const manifestPath = path.join(templatesDir, 'va-vr-base', 'meta', 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    return fs.readFileSync(manifestPath, 'utf-8');
  }
  return '{}';
}
