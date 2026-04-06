import * as path from 'node:path';
import * as fs from 'node:fs';
import { getOpenAIClient, getModel } from './openai-client.js';
import { collectBootstrapContext } from './collect-bootstrap-context.js';
import { buildBootstrapPrompt } from './build-bootstrap-prompt.js';
import { writeMetaSourceFromAi } from './write-meta-source-from-ai.js';
import { AI_BOOTSTRAP_RESPONSE_SCHEMA, type AiBootstrapResponse } from './schemas/ai-bootstrap.schema.js';

export interface AiBootstrapOptions {
  templateId: string;
  templatesDir: string;
}

export interface AiBootstrapReport {
  templateId: string;
  model: string;
  filesCreated: string[];
  warnings: string[];
  tokensUsed: { prompt: number; completion: number; total: number };
  durationMs: number;
}

/**
 * Orquestrador do ai-bootstrap-meta.
 *
 * 1. Valida que o template existe e tem project/
 * 2. Coleta contexto do projeto Angular + referência VA/VR
 * 3. Constrói prompt e chama OpenAI com structured output
 * 4. Escreve meta-source/ a partir da resposta
 * 5. Retorna report
 */
export async function runAiBootstrapMeta(
  options: AiBootstrapOptions,
): Promise<AiBootstrapReport> {
  const start = Date.now();
  const { templateId, templatesDir } = options;

  // 1. Validar estrutura
  const templateDir = path.join(templatesDir, templateId);
  const projectDir = path.join(templateDir, 'project');
  const metaSourceDir = path.join(templateDir, 'meta-source');

  if (!fs.existsSync(templateDir)) {
    throw new Error(
      `Template "${templateId}" não encontrado em ${templatesDir}.\n` +
      `Execute init-template primeiro: npm run init-template -- --template-id ${templateId} --from <projeto>`,
    );
  }

  if (!fs.existsSync(projectDir)) {
    throw new Error(
      `Diretório project/ não encontrado em ${templateDir}.\n` +
      `O template precisa de project/ com o código Angular.`,
    );
  }

  if (fs.existsSync(metaSourceDir) && fs.readdirSync(metaSourceDir).length > 0) {
    console.log('⚠️  meta-source/ já contém arquivos. Serão sobrescritos pela IA.');
  }

  // 2. Coletar contexto
  console.log('📂 Coletando contexto do projeto Angular...');
  const ctx = collectBootstrapContext(templateId, projectDir, templatesDir);
  console.log(`   → ${ctx.projectFiles.size} arquivo(s) do projeto`);
  console.log(`   → ${ctx.referenceMetaSource.size} arquivo(s) de referência VA/VR`);

  // 3. Construir prompt
  console.log('🧠 Construindo prompt para OpenAI...');
  const messages = buildBootstrapPrompt(ctx);

  // 4. Chamar OpenAI
  const model = getModel();
  console.log(`🤖 Chamando OpenAI (${model})...`);

  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model,
    messages,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'ai_bootstrap_response',
        strict: true,
        schema: AI_BOOTSTRAP_RESPONSE_SCHEMA,
      },
    },
    temperature: 0.2,
  });

  const choice = response.choices[0];
  if (!choice?.message?.content) {
    throw new Error('OpenAI retornou resposta vazia. Verifique o modelo e a API key.');
  }

  // 5. Parsear resposta
  console.log('📋 Processando resposta da IA...');
  let aiData: AiBootstrapResponse;
  try {
    aiData = JSON.parse(choice.message.content) as AiBootstrapResponse;
  } catch (parseErr) {
    throw new Error(
      `Falha ao parsear JSON da resposta da OpenAI.\n` +
      `Conteúdo (primeiros 500 chars): ${choice.message.content.slice(0, 500)}`,
    );
  }

  // 6. Escrever meta-source/
  console.log('✏️  Escrevendo meta-source/...');
  const filesCreated = writeMetaSourceFromAi(metaSourceDir, aiData);
  console.log(`   → ${filesCreated.length} arquivo(s) criados`);

  // 7. Exibir warnings
  if (aiData.warnings.length > 0) {
    console.log('\n⚠️  Warnings da IA:');
    for (const w of aiData.warnings) {
      console.log(`   • ${w}`);
    }
  }

  // 8. Report
  const tokensUsed = {
    prompt: response.usage?.prompt_tokens ?? 0,
    completion: response.usage?.completion_tokens ?? 0,
    total: response.usage?.total_tokens ?? 0,
  };

  const report: AiBootstrapReport = {
    templateId,
    model,
    filesCreated,
    warnings: aiData.warnings,
    tokensUsed,
    durationMs: Date.now() - start,
  };

  return report;
}
