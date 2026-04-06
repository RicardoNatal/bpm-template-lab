import * as path from 'node:path';
import * as fs from 'node:fs';
import { runGenerate } from './commands/generate-command.js';
import { runInitTemplate } from './commands/init-template.js';
import { runSyncMeta } from './commands/sync-meta.js';
import { runValidateTemplate } from './commands/validate-template-command.js';
import { runAiBootstrapMetaCommand } from './commands/ai-bootstrap-meta.js';
import { runPublish } from './commands/publish-command.js';

/**
 * CLI do Gerador BPM V1.2.
 *
 * Subcomandos:
 *   generate            <request.json>                  — gerar variante
 *   init-template       --template-id X --from Y        — bootstrap de novo template
 *   sync-meta           --template-id X                 — converter meta-source/ → meta/
 *   validate-template   --template-id X                 — validar template
 *   ai-bootstrap-meta   --template-id X                 — bootstrap meta-source via IA
 *   publish             <slug>                          — publicar modelo no registry
 *
 * Exemplos:
 *   npm run generate -- ../../playground/requests/modelo-1.json
 *   npm run init-template -- --template-id plano-saude-base --from ../../../meu-projeto
 *   npm run sync-meta -- --template-id plano-saude-base
 *   npm run validate-template -- --template-id plano-saude-base
 */
function main(): void {
  const repoRoot = resolveRepoRoot();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printUsage();
    process.exit(1);
  }

  const command = args[0];

  try {
    switch (command) {
      case 'generate':
        handleGenerate(args.slice(1), repoRoot);
        break;

      case 'init-template':
        handleInitTemplate(args.slice(1), repoRoot);
        break;

      case 'sync-meta':
        handleSyncMeta(args.slice(1), repoRoot);
        break;

      case 'validate-template':
        handleValidateTemplate(args.slice(1), repoRoot);
        break;

      case 'ai-bootstrap-meta':
        handleAiBootstrapMeta(args.slice(1), repoRoot);
        break;

      case 'publish':
        handlePublish(args.slice(1), repoRoot);
        break;

      default:
        // Backward compat: se o argumento parece ser um caminho de arquivo JSON, tratar como generate
        if (command.endsWith('.json')) {
          handleGenerate(args, repoRoot);
        } else {
          console.error(`Comando desconhecido: "${command}"`);
          printUsage();
          process.exit(1);
        }
    }
  } catch (err) {
    console.error(`\n❌ Erro: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Handlers de subcomandos
// ---------------------------------------------------------------------------

function handleGenerate(args: string[], repoRoot: string): void {
  if (args.length === 0) {
    console.error('Uso: npm run generate -- <caminho-para-request.json>');
    process.exit(1);
  }
  runGenerate(args[0], repoRoot);
}

function handleInitTemplate(args: string[], repoRoot: string): void {
  const templateId = getArg(args, '--template-id');
  const fromPath = getArg(args, '--from');

  if (!templateId || !fromPath) {
    console.error('Uso: npm run init-template -- --template-id <id> --from <caminho-projeto>');
    process.exit(1);
  }

  const templatesDir = path.join(repoRoot, 'templates');
  runInitTemplate({ templateId, fromPath, templatesDir });
}

function handleSyncMeta(args: string[], repoRoot: string): void {
  const templateId = getArg(args, '--template-id');

  if (!templateId) {
    console.error('Uso: npm run sync-meta -- --template-id <id>');
    process.exit(1);
  }

  const templatesDir = path.join(repoRoot, 'templates');
  runSyncMeta({ templateId, templatesDir });
}

function handleValidateTemplate(args: string[], repoRoot: string): void {
  const templateId = getArg(args, '--template-id');

  if (!templateId) {
    console.error('Uso: npm run validate-template -- --template-id <id>');
    process.exit(1);
  }

  const templatesDir = path.join(repoRoot, 'templates');
  runValidateTemplate({ templateId, templatesDir });
}

function handlePublish(args: string[], repoRoot: string): void {
  if (args.length === 0) {
    console.error('Uso: npm run publish -- <slug>');
    console.error('  Ex: npm run publish -- va-vr-modelo-1');
    console.error('\nPublicar todos:');
    console.error('  npm run publish -- --all');
    process.exit(1);
  }

  if (args[0] === '--all') {
    const outputDir = path.join(repoRoot, 'output');
    const entries = fs.readdirSync(outputDir).filter(e =>
      fs.statSync(path.join(outputDir, e)).isDirectory() &&
      fs.existsSync(path.join(outputDir, e, '_generation-report.json'))
    );
    for (const slug of entries) {
      runPublish(slug, repoRoot);
    }
    return;
  }

  runPublish(args[0], repoRoot);
}

function handleAiBootstrapMeta(args: string[], repoRoot: string): void {
  const templateId = getArg(args, '--template-id');

  if (!templateId) {
    console.error('Uso: npm run ai-bootstrap-meta -- --template-id <id>');
    process.exit(1);
  }

  const templatesDir = path.join(repoRoot, 'templates');
  runAiBootstrapMetaCommand({ templateId, templatesDir }).catch((err) => {
    console.error(`\n❌ Erro: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  });
}

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------

function getArg(args: string[], name: string): string | undefined {
  const idx = args.indexOf(name);
  if (idx === -1 || idx + 1 >= args.length) return undefined;
  return args[idx + 1];
}

function resolveRepoRoot(): string {
  const generatorPackageDir = path.resolve(
    path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')),
    '..',
  );
  return path.resolve(generatorPackageDir, '..', '..');
}

function printUsage(): void {
  console.log(`
Gerador BPM V1.1 — Template Lab

Comandos disponíveis:

  generate <request.json>
    Gera uma variante a partir de um request JSON.
    Ex: npm run generate -- ../../playground/requests/modelo-1.json

  init-template --template-id <id> --from <caminho>
    Bootstrap de um novo template a partir de um projeto Angular.
    Ex: npm run init-template -- --template-id plano-saude-base --from ../../../meu-projeto

  sync-meta --template-id <id>
    Converte meta-source/ (TypeScript) em meta/ (JSON).
    Ex: npm run sync-meta -- --template-id plano-saude-base

  validate-template --template-id <id>
    Valida se um template está pronto para geração.
    Ex: npm run validate-template -- --template-id plano-saude-base

  ai-bootstrap-meta --template-id <id>
    Usa OpenAI para gerar meta-source/ a partir do código Angular.
    Requer OPENAI_API_KEY em .env ou variável de ambiente.
    Ex: npm run ai-bootstrap-meta -- --template-id plano-saude-base

  publish <slug>
    Publica um modelo gerado no registry (catálogo de modelos).
    Ex: npm run publish -- va-vr-modelo-1
    Ex: npm run publish -- --all
`);
}

main();
