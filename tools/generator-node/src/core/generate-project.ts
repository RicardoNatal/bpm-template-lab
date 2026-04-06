import * as path from 'node:path';
import type { GenerationRequest, GenerationReport } from '../types/generator.types.js';
import { loadTemplate } from './load-template.js';
import { validateTemplate } from './validate-template.js';
import { buildGenerationPlan } from './build-generation-plan.js';
import { applyGenerationPlan } from './apply-generation-plan.js';

export interface GenerateProjectOptions {
  /** Caminho absoluto para a pasta templates/ do repositório */
  templatesDir: string;
  /** Caminho absoluto para a pasta output/ do repositório */
  outputDir: string;
  /** Request de geração */
  request: GenerationRequest;
}

/**
 * Fluxo principal do gerador.
 *
 * 1. Carrega o template
 * 2. Valida consistência
 * 3. Constrói o plano
 * 4. Aplica o plano (copia + transforma)
 * 5. Retorna relatório
 */
export function generateProject(options: GenerateProjectOptions): GenerationReport {
  const { templatesDir, outputDir, request } = options;

  console.log(`\n🚀 Gerador BPM V1`);
  console.log(`   Template: ${request.templateId}`);
  console.log(`   Preset:   ${request.presetId}`);
  console.log(`   Projeto:  ${request.project.name}`);

  // 1. Carregar template
  console.log(`\n📖 Carregando template "${request.templateId}"...`);
  const template = loadTemplate(templatesDir, request.templateId);

  // 2. Validar
  console.log(`🔍 Validando template...`);
  const validation = validateTemplate(template);

  if (validation.warnings.length > 0) {
    console.log(`⚠️  Warnings de validação:`);
    for (const w of validation.warnings) {
      console.log(`   - ${w}`);
    }
  }

  if (!validation.valid) {
    console.error(`❌ Template inválido:`);
    for (const e of validation.errors) {
      console.error(`   - ${e}`);
    }
    throw new Error(`Template "${request.templateId}" falhou na validação com ${validation.errors.length} erro(s).`);
  }
  console.log(`✅ Template válido.`);

  // 3. Construir plano
  const projectOutputDir = path.join(outputDir, request.project.slug);
  console.log(`\n📐 Construindo plano de geração...`);
  const plan = buildGenerationPlan(template, request, projectOutputDir);
  console.log(`   ${plan.operations.length} operação(ões) no plano.`);

  // 4. Aplicar plano
  console.log(`\n🔧 Aplicando plano de geração...`);
  const report = applyGenerationPlan(template, plan);

  return report;
}
