import * as path from 'node:path';
import * as fs from 'node:fs';
import { createTemplateStructure } from '../scaffolding/create-template-structure.js';
import { copyAngularProject } from '../scaffolding/copy-angular-project.js';
import { createMetaSourceSkeleton } from '../scaffolding/create-meta-source-skeleton.js';
import { inferRoutes } from '../scaffolding/infer-routes.js';
import { inferComponents, findHtmlFiles } from '../scaffolding/infer-components.js';
import { buildInitReport } from '../scaffolding/build-init-report.js';
import { printInitReport, serializeInitReport } from '../reports/init-report.js';
import { writeFile } from '../io/index.js';
import type { InitTemplateOptions, InferredInfo } from '../types/meta-source.types.js';

/**
 * Comando init-template: bootstrap assistido de um novo template.
 *
 * 1. cria estrutura de diretórios
 * 2. copia projeto Angular base
 * 3. infere rotas e componentes (melhor esforço)
 * 4. gera meta-source/ com placeholders
 * 5. produz relatório de bootstrap
 */
export function runInitTemplate(options: InitTemplateOptions): void {
  const { templateId, fromPath, templatesDir } = options;

  console.log(`\n📦 init-template: Bootstrapping "${templateId}"...`);

  // Validar que o template não existe ainda
  const targetDir = path.join(templatesDir, templateId);
  if (fs.existsSync(targetDir)) {
    const metaSourceDir = path.join(targetDir, 'meta-source');
    if (fs.existsSync(metaSourceDir) && fs.readdirSync(metaSourceDir).length > 0) {
      throw new Error(
        `Template "${templateId}" já existe em ${targetDir} e já contém meta-source/.\n` +
        `Se deseja refazer, remova o diretório manualmente primeiro.`,
      );
    }
  }

  // 1. Criar estrutura
  console.log(`\n📂 Criando estrutura de diretórios...`);
  const templateDir = createTemplateStructure(templatesDir, templateId);

  // 2. Copiar projeto Angular
  console.log(`📁 Copiando projeto Angular...`);
  copyAngularProject(fromPath, templateDir);

  const projectDir = path.join(templateDir, 'project');

  // 3. Inferir rotas e componentes do projeto
  console.log(`🔍 Analisando projeto Angular...`);
  const routes = inferRoutes(projectDir);
  const components = inferComponents(projectDir);
  const htmlFiles = findHtmlFiles(projectDir);
  const modules = extractModuleNames(projectDir);

  const inferred: InferredInfo = {
    routes,
    components,
    modules,
    htmlFiles,
  };

  console.log(`   ${routes.length} rota(s) inferida(s)`);
  console.log(`   ${components.length} componente(s) encontrado(s)`);
  console.log(`   ${htmlFiles.length} arquivo(s) HTML encontrado(s)`);
  console.log(`   ${modules.length} módulo(s) encontrado(s)`);

  // 4. Gerar meta-source skeleton
  console.log(`\n📝 Gerando meta-source/ com placeholders...`);
  const metaSourceDir = path.join(templateDir, 'meta-source');
  const createdFiles = createMetaSourceSkeleton(metaSourceDir, templateId, routes, components);

  // 5. Gerar relatório
  const report = buildInitReport(templateId, templateDir, inferred, createdFiles);

  // Gravar relatório em arquivo
  const reportPath = path.join(templateDir, '_bootstrap-report.json');
  writeFile(reportPath, serializeInitReport(report));

  printInitReport(report);
}

/**
 * Extrai nomes de módulos Angular do projeto (melhor esforço).
 */
function extractModuleNames(projectDir: string): string[] {
  const modules: string[] = [];
  scanForModules(projectDir, modules);
  return modules;
}

function scanForModules(dir: string, results: string[]): void {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
      scanForModules(fullPath, results);
    } else if (entry.name.endsWith('.module.ts')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const match = content.match(/export\s+class\s+(\w+Module)/);
      if (match) {
        results.push(match[1]);
      }
    }
  }
}
