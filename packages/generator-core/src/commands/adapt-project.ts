import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runAdaptProject, type AdaptProjectReport } from '../ai/adapt-project.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface AdaptProjectCommandOptions {
  templateId: string;
  templatesDir: string;
}

/**
 * Comando adapt-project: usa OpenAI para adaptar projeto Angular aos padrões do Template Lab.
 *
 * Lê ANGULAR_PROJECT_STANDARDS.md e aplica refatorações automáticas no project/.
 * Requer OPENAI_API_KEY configurada em .env ou variável de ambiente.
 */
export async function runAdaptProjectCommand(options: AdaptProjectCommandOptions): Promise<void> {
  const { templateId, templatesDir } = options;

  console.log(`\n🔧 adapt-project: Adaptação de "${templateId}" aos padrões do Template Lab...\n`);

  // Carregar .env
  await loadEnvFile(path.join(__dirname, '..', '..', '.env'));

  const report = await runAdaptProject({ templateId, templatesDir });

  printReport(report);
}

/**
 * Carrega .env manualmente (sem dependência externa).
 */
async function loadEnvFile(envPath: string): Promise<void> {
  try {
    const fs = await import('node:fs');
    if (!fs.existsSync(envPath)) return;

    const content = fs.readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env opcional
  }
}

function printReport(report: AdaptProjectReport): void {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ADAPT PROJECT — RELATÓRIO`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`  Template:    ${report.templateId}`);
  console.log(`  Modelo IA:   ${report.model}`);
  console.log(`  Duração:     ${(report.durationMs / 1000).toFixed(1)}s`);
  console.log(`  Tokens:      ${report.tokensUsed.total} (prompt: ${report.tokensUsed.prompt}, completion: ${report.tokensUsed.completion})`);
  console.log(`  Operações:   ${report.operationsApplied}`);

  console.log(`\n  📝 Resumo: ${report.summary}`);

  if (report.filesCreated.length > 0) {
    console.log(`\n  ✅ Arquivos criados (${report.filesCreated.length}):`);
    for (const f of report.filesCreated) {
      console.log(`    + ${f}`);
    }
  }

  if (report.filesModified.length > 0) {
    console.log(`\n  ✏️  Arquivos modificados (${report.filesModified.length}):`);
    for (const f of report.filesModified) {
      console.log(`    ~ ${f}`);
    }
  }

  if (report.alreadyCompliant.length > 0) {
    console.log(`\n  ✔️  Já em conformidade (${report.alreadyCompliant.length}):`);
    for (const item of report.alreadyCompliant) {
      console.log(`    • ${item}`);
    }
  }

  if (report.warnings.length > 0) {
    console.log(`\n  ⚠️  Warnings (${report.warnings.length}):`);
    for (const w of report.warnings) {
      console.log(`    • ${w}`);
    }
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  Próximos passos:`);
  console.log(`    1. Revise as alterações em project/ — especialmente as lógicas modificadas`);
  console.log(`    2. Execute: npm run ai-bootstrap-meta -- --template-id ${report.templateId}`);
  console.log(`    3. Revise e ajuste os presets em meta-source/workflow-presets.config.ts`);
  console.log(`    4. Execute: npm run sync-meta -- --template-id ${report.templateId}`);
  console.log(`    5. Execute: npm run validate-template -- --template-id ${report.templateId}`);
  console.log(`${'─'.repeat(60)}\n`);
}
