import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runAiBootstrapMeta, type AiBootstrapReport } from '../ai/ai-bootstrap-meta.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface AiBootstrapMetaCommandOptions {
  templateId: string;
  templatesDir: string;
}

/**
 * Comando ai-bootstrap-meta: usa OpenAI para gerar meta-source/ a partir do projeto Angular.
 *
 * Requer OPENAI_API_KEY configurada em .env ou variável de ambiente.
 */
export async function runAiBootstrapMetaCommand(options: AiBootstrapMetaCommandOptions): Promise<void> {
  const { templateId, templatesDir } = options;

  console.log(`\n🤖 ai-bootstrap-meta: Bootstrap IA para "${templateId}"...\n`);

  // Carregar .env se existir
  await loadEnvFile(path.join(__dirname, '..', '..', '.env'));

  const report = await runAiBootstrapMeta({ templateId, templatesDir });

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

function printReport(report: AiBootstrapReport): void {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  AI BOOTSTRAP META — RELATÓRIO`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`  Template:    ${report.templateId}`);
  console.log(`  Modelo IA:   ${report.model}`);
  console.log(`  Duração:     ${(report.durationMs / 1000).toFixed(1)}s`);
  console.log(`  Tokens:      ${report.tokensUsed.total} (prompt: ${report.tokensUsed.prompt}, completion: ${report.tokensUsed.completion})`);
  console.log(`  Arquivos:    ${report.filesCreated.length}`);

  for (const f of report.filesCreated) {
    console.log(`    ✅ ${f}`);
  }

  if (report.warnings.length > 0) {
    console.log(`\n  ⚠️  Warnings (${report.warnings.length}):`);
    for (const w of report.warnings) {
      console.log(`    • ${w}`);
    }
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  Próximos passos:`);
  console.log(`    1. Revise os arquivos em meta-source/ — ajuste tipos, labels e IDs`);
  console.log(`    2. Execute: npm run sync-meta -- --template-id ${report.templateId}`);
  console.log(`    3. Execute: npm run validate-template -- --template-id ${report.templateId}`);
  console.log(`${'─'.repeat(60)}\n`);
}
