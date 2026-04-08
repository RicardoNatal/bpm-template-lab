import * as path from 'node:path';
import * as fs from 'node:fs';
import { generateProject } from '../core/generate-project.js';
import { printReport, serializeReport } from '../reports/generation-report.js';
import { readJson, writeFile } from '../io/index.js';
import type { GenerationRequest } from '../types/generator.types.js';

/**
 * Comando generate: geração de variantes (V1 existente, intacto).
 *
 * Lê SOMENTE meta/*.json. Resolve preset, monta plan, aplica transforms.
 */
export function runGenerate(requestPath: string, repoRoot: string): void {
  const resolvedPath = path.resolve(requestPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Arquivo de request não encontrado: ${resolvedPath}`);
  }

  let request: GenerationRequest;
  try {
    request = readJson<GenerationRequest>(resolvedPath);
  } catch (err) {
    throw new Error(`Erro ao ler request JSON: ${err instanceof Error ? err.message : err}`);
  }

  if (!request.templateId || !request.presetId || !request.project?.slug) {
    throw new Error('Request inválido. Campos obrigatórios: templateId, presetId, project.slug');
  }

  const templatesDir = path.join(repoRoot, 'templates');
  const outputDir = path.join(repoRoot, 'output');

  // Garantir que output/ existe
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const report = generateProject({
    templatesDir,
    outputDir,
    request,
  });

  printReport(report);

  // Gravar relatório em arquivo
  const reportPath = path.join(outputDir, request.project.slug, '_generation-report.json');
  writeFile(reportPath, serializeReport(report));
  console.log(`📄 Relatório gravado em: ${reportPath}\n`);

  if (!report.success) {
    process.exit(1);
  }
}
