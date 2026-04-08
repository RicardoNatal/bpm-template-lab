import * as path from 'node:path';
import * as fs from 'node:fs';
import { copyDir } from '../io/index.js';

/**
 * Copia o projeto Angular de --from para templates/<templateId>/project/.
 * Valida que o diretório fonte existe e contém um angular.json.
 */
export function copyAngularProject(fromPath: string, templateDir: string): void {
  const resolvedFrom = path.resolve(fromPath);
  const projectDir = path.join(templateDir, 'project');

  if (!fs.existsSync(resolvedFrom)) {
    throw new Error(`Diretório de origem não encontrado: ${resolvedFrom}`);
  }

  const angularJson = path.join(resolvedFrom, 'angular.json');
  if (!fs.existsSync(angularJson)) {
    console.warn(`⚠️  angular.json não encontrado em ${resolvedFrom}. Copiando mesmo assim.`);
  }

  console.log(`📁 Copiando projeto Angular de ${resolvedFrom} para ${projectDir}...`);
  copyDir(resolvedFrom, projectDir);

  // Remover node_modules se copiado
  const nodeModules = path.join(projectDir, 'node_modules');
  if (fs.existsSync(nodeModules)) {
    console.log(`🗑️  Removendo node_modules copiado...`);
    fs.rmSync(nodeModules, { recursive: true });
  }

  // Remover .git se copiado
  const gitDir = path.join(projectDir, '.git');
  if (fs.existsSync(gitDir)) {
    fs.rmSync(gitDir, { recursive: true });
  }
}
