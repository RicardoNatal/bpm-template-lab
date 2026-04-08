import * as path from 'node:path';
import { ensureDir } from '../io/index.js';

/**
 * Cria a estrutura de diretórios para um novo template.
 *
 * templates/<templateId>/
 *   project/
 *   meta-source/
 *   meta/
 */
export function createTemplateStructure(templatesDir: string, templateId: string): string {
  const templateDir = path.join(templatesDir, templateId);
  const projectDir = path.join(templateDir, 'project');
  const metaSourceDir = path.join(templateDir, 'meta-source');
  const metaDir = path.join(templateDir, 'meta');

  ensureDir(templateDir);
  ensureDir(projectDir);
  ensureDir(metaSourceDir);
  ensureDir(metaDir);

  return templateDir;
}
