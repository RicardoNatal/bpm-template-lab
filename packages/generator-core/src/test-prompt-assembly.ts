/**
 * Script de dry-run para validar a montagem do prompt.
 * Não chama a OpenAI — apenas coleta contexto e imprime a estrutura.
 *
 * Uso: npx tsx src/test-prompt-assembly.ts
 */
import * as path from 'node:path';
import { collectBootstrapContext } from './ai/collect-bootstrap-context.js';
import { buildBootstrapPrompt } from './ai/build-bootstrap-prompt.js';

const repoRoot = path.resolve(
  path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')),
  '..', '..', '..',
);
const templatesDir = path.join(repoRoot, 'templates');
const templateId = 'va-vr-base';
const projectDir = path.join(templatesDir, templateId, 'project');

console.log('='.repeat(70));
console.log('  DRY-RUN: Montagem do prompt ai-bootstrap-meta');
console.log('='.repeat(70));
console.log(`  Repo root:     ${repoRoot}`);
console.log(`  Templates dir: ${templatesDir}`);
console.log(`  Template:      ${templateId}`);
console.log(`  Project dir:   ${projectDir}`);
console.log('');

// 1. Coletar contexto
console.log('📂 Coletando contexto...');
const ctx = collectBootstrapContext(templateId, projectDir, templatesDir);

console.log('');
console.log('─── Resumo do contexto coletado ───');
console.log(`  ✅ conceptSpec:          ${ctx.conceptSpec ? `${ctx.conceptSpec.length} chars` : '❌ NÃO ENCONTRADO'}`);
console.log(`  📁 projectFiles:         ${ctx.projectFiles.size} arquivo(s)`);
console.log(`  📁 referenceMetaSource:  ${ctx.referenceMetaSource.size} arquivo(s)`);
console.log(`  📄 referenceManifest:    ${ctx.referenceManifestJson.length} chars`);
console.log('');

if (ctx.projectFiles.size > 0) {
  console.log('  Arquivos do projeto:');
  for (const [relPath, content] of ctx.projectFiles) {
    console.log(`    → ${relPath} (${content.length} chars)`);
  }
  console.log('');
}

if (ctx.referenceMetaSource.size > 0) {
  console.log('  Arquivos de referência VA/VR (secundário):');
  for (const [name, content] of ctx.referenceMetaSource) {
    console.log(`    → ${name} (${content.length} chars)`);
  }
  console.log('');
}

// 2. Montar prompt
console.log('🧠 Montando prompt...');
const messages = buildBootstrapPrompt(ctx);

console.log('');
console.log('─── Estrutura do prompt ───');
for (const msg of messages) {
  console.log(`  [${msg.role}] ${msg.content.length} chars`);

  // Verificar se as seções esperadas estão presentes
  const checks = [
    { label: 'AUTORIDADE PRIMÁRIA (spec conceitual)', pattern: /AUTORIDADE PRIMÁRIA/ },
    { label: 'Exemplo secundário VA/VR', pattern: /Exemplo secundário/ },
    { label: 'manifest.json de exemplo', pattern: /manifest\.json/ },
    { label: 'JSON Schema da resposta', pattern: /JSON Schema/ },
    { label: 'Formato de saída', pattern: /Formato de saída/ },
  ];

  for (const check of checks) {
    const found = check.pattern.test(msg.content);
    console.log(`    ${found ? '✅' : '❌'} ${check.label}`);
  }
  console.log('');
}

// 3. Tamanho total estimado
const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0);
const estimatedTokens = Math.round(totalChars / 3.5); // estimativa grosseira
console.log('─── Estimativas ───');
console.log(`  Total de caracteres: ${totalChars.toLocaleString()}`);
console.log(`  Tokens estimados:    ~${estimatedTokens.toLocaleString()}`);
console.log('');

// 4. Prévia do system message (primeiros 500 chars)
console.log('─── Prévia do system message (500 chars) ───');
console.log(messages[0].content.slice(0, 500));
console.log('... [truncado]');
console.log('');

console.log('✅ Montagem do prompt concluída com sucesso!');
