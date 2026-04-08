import * as path from 'node:path';
import * as fs from 'node:fs';
import { getOpenAIClient, getModel } from './openai-client.js';
import { collectBootstrapContext } from './collect-bootstrap-context.js';
import {
  ADAPT_PROJECT_RESPONSE_SCHEMA,
  type AdaptProjectResponse,
  type AdaptFileOperation,
} from './schemas/adapt-project.schema.js';

export interface AdaptProjectOptions {
  templateId: string;
  templatesDir: string;
}

export interface AdaptProjectReport {
  templateId: string;
  model: string;
  summary: string;
  operationsApplied: number;
  filesCreated: string[];
  filesModified: string[];
  alreadyCompliant: string[];
  warnings: string[];
  tokensUsed: { prompt: number; completion: number; total: number };
  durationMs: number;
}

/** Máximo de caracteres de arquivos do projeto por chunk */
const CHUNK_MAX_CHARS = 15_000;

/**
 * Orquestrador do adapt-project (chunked).
 *
 * Divide os arquivos do projeto em lotes menores e faz múltiplas chamadas
 * à IA para evitar timeout do gateway. As operações são acumuladas e
 * aplicadas ao final.
 */
export async function runAdaptProject(
  options: AdaptProjectOptions,
): Promise<AdaptProjectReport> {
  const start = Date.now();
  const { templateId, templatesDir } = options;

  // 1. Validar estrutura
  const templateDir = path.join(templatesDir, templateId);
  const projectDir = path.join(templateDir, 'project');

  if (!fs.existsSync(templateDir)) {
    throw new Error(
      `Template "${templateId}" não encontrado em ${templatesDir}.\n` +
        `Execute init-template primeiro.`,
    );
  }

  if (!fs.existsSync(projectDir)) {
    throw new Error(
      `Diretório project/ não encontrado em ${templateDir}.\n` +
        `O template precisa de project/ com o código Angular.`,
    );
  }

  // 2. Ler padrões
  const standardsPath = path.join(templatesDir, 'ANGULAR_PROJECT_STANDARDS.md');
  if (!fs.existsSync(standardsPath)) {
    throw new Error(
      `ANGULAR_PROJECT_STANDARDS.md não encontrado em ${templatesDir}.\n` +
        `Este arquivo é necessário para o adapt-project.`,
    );
  }
  const standardsContent = fs.readFileSync(standardsPath, 'utf-8');

  // 3. Coletar contexto
  console.log('📂 Coletando contexto do projeto Angular...');
  const ctx = collectBootstrapContext(templateId, projectDir, templatesDir);
  console.log(`   → ${ctx.projectFiles.size} arquivo(s) do projeto`);
  console.log(`   → ${ctx.referenceMetaSource.size} arquivo(s) de referência VA/VR (secundário)`);

  // 4. Dividir arquivos em chunks
  const chunks = chunkProjectFiles(ctx.projectFiles, CHUNK_MAX_CHARS);
  console.log(`📦 Dividido em ${chunks.length} lote(s) para processamento`);

  // 5. System message (apenas padrões Angular — sem referência VA/VR nem concept spec para manter leve)
  const systemMessage = buildSystemMessage(standardsContent);

  const model = getModel();
  const client = getOpenAIClient();

  // 6. Processar cada chunk sequencialmente
  const allOperations: AdaptFileOperation[] = [];
  const allCompliant: string[] = [];
  const allWarnings: string[] = [];
  const summaries: string[] = [];
  const totalTokens = { prompt: 0, completion: 0, total: 0 };

  // Lista de todos os arquivos para contexto cruzado
  const fileList = Array.from(ctx.projectFiles.keys()).join(', ');

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkFileNames = chunk.map(([name]) => name).join(', ');
    console.log(`\n🤖 Lote ${i + 1}/${chunks.length}: ${chunk.length} arquivo(s) [${chunkFileNames}]`);
    console.log(`   Modelo: ${model}`);

    const filesContent = chunk
      .map(([relPath, content]) => `### ${relPath}\n\`\`\`typescript\n${content}\n\`\`\``)
      .join('\n\n');

    const userMessage = `Analise os arquivos Angular abaixo (lote ${i + 1}/${chunks.length}) e retorne as operações de adaptação para conformidade com ANGULAR_PROJECT_STANDARDS.md.

Template: "${ctx.templateId}"

## Todos os arquivos do projeto (para contexto)
${fileList}

## Arquivos deste lote (para análise)

${filesContent}

## Instruções específicas

1. Analise SOMENTE os arquivos deste lote.
2. Verifique se template/config/, template/types/ e template/helpers/ existem. Se não, crie-os (apenas no primeiro lote que contenha routing).
3. Verifique se app-routing.module.ts usa STEP_ROUTE_MAP e routeDataFor(). Se não, refatore.
4. Encontre todo uso de router.url.startsWith() ou router.url.includes() e substitua por resolveStepRouteData().
5. Adicione data-template-block-instance em todos os seletores de blocos de UI nos HTMLs.
6. Envolva blocos opcionais com comentários TEMPLATE:OPTIONAL.
7. Verifique se cada etapa é um módulo lazy separado.
8. Crie template/types/template.types.ts com os tipos literais corretos para este projeto (apenas se routing estiver neste lote).
9. Crie template/helpers/step-resolver.ts com o helper padrão (apenas se routing estiver neste lote).
10. Se nenhum arquivo deste lote precisa de adaptação, retorne operations vazio.

Responda SOMENTE com o JSON conforme o schema.
`;

    try {
      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'adapt_project_response',
            strict: true,
            schema: ADAPT_PROJECT_RESPONSE_SCHEMA,
          },
        },
        temperature: 0.2,
      }, { timeout: 180_000 });

      const choice = response.choices[0];
      if (!choice?.message?.content) {
        console.warn(`   ⚠️  Lote ${i + 1}: resposta vazia, pulando...`);
        continue;
      }

      let aiData: AdaptProjectResponse;
      try {
        aiData = JSON.parse(choice.message.content) as AdaptProjectResponse;
      } catch {
        console.warn(`   ⚠️  Lote ${i + 1}: JSON inválido, pulando...`);
        console.warn(`      ${choice.message.content.slice(0, 200)}`);
        continue;
      }

      if (!Array.isArray(aiData.operations)) {
        console.warn(`   ⚠️  Lote ${i + 1}: operations não é array (${typeof aiData.operations}), pulando...`);
        continue;
      }

      console.log(`   ✅ ${aiData.operations.length} operação(ões), ${aiData.alreadyCompliant?.length ?? 0} já conformes`);

      allOperations.push(...aiData.operations);
      if (aiData.alreadyCompliant) allCompliant.push(...aiData.alreadyCompliant);
      if (aiData.warnings) allWarnings.push(...aiData.warnings);
      if (aiData.summary) summaries.push(aiData.summary);

      totalTokens.prompt += response.usage?.prompt_tokens ?? 0;
      totalTokens.completion += response.usage?.completion_tokens ?? 0;
      totalTokens.total += response.usage?.total_tokens ?? 0;

    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`   ❌ Lote ${i + 1} falhou: ${errMsg.slice(0, 200)}`);
      console.error(`   Continuando com próximo lote...`);
    }
  }

  // 7. Aplicar todas as operações acumuladas
  console.log(`\n✏️  Aplicando ${allOperations.length} adaptação(ões) no projeto...`);
  const { filesCreated, filesModified } = applyOperations(projectDir, allOperations);

  return {
    templateId,
    model,
    summary: summaries.join(' | '),
    operationsApplied: allOperations.length,
    filesCreated,
    filesModified,
    alreadyCompliant: allCompliant,
    warnings: allWarnings,
    tokensUsed: totalTokens,
    durationMs: Date.now() - start,
  };
}

/**
 * Divide os arquivos do projeto em chunks de tamanho máximo.
 */
function chunkProjectFiles(
  files: Map<string, string>,
  maxChars: number,
): Array<Array<[string, string]>> {
  const chunks: Array<Array<[string, string]>> = [];
  let currentChunk: Array<[string, string]> = [];
  let currentSize = 0;

  for (const [relPath, content] of files) {
    const entrySize = relPath.length + content.length + 50; // overhead do markdown

    if (currentChunk.length > 0 && currentSize + entrySize > maxChars) {
      chunks.push(currentChunk);
      currentChunk = [];
      currentSize = 0;
    }

    currentChunk.push([relPath, content]);
    currentSize += entrySize;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

function buildSystemMessage(
  standards: string,
): string {
  return `Você é um especialista em refatoração de projetos Angular para conformidade com padrões de templates BPM.

Sua tarefa é analisar arquivos de um projeto Angular e retornar as operações necessárias para
adaptá-lo aos padrões definidos no documento abaixo.

## Documento de padrões (ANGULAR_PROJECT_STANDARDS.md) — AUTORIDADE PRIMÁRIA

${standards}

## Regras de operação

1. Para cada arquivo que precisa ser criado ou modificado, retorne o conteúdo COMPLETO.
2. Não retorne partial diffs — retorne o arquivo inteiro para operações "modify".
3. Mantenha a lógica de negócio do projeto original intacta.
4. Adapte apenas a estrutura e os padrões (routing, resolução de step, marcação de blocos).
5. Preserve imports, services, models e toda lógica funcional.
6. Se um padrão já estiver correto, liste-o em "alreadyCompliant".
7. Se algo for ambíguo ou precisar de decisão humana, inclua em "warnings".
8. Não crie presets — eles serão definidos manualmente depois.
9. Se nenhum arquivo do lote precisa de adaptação, retorne operations como array vazio.

## Formato de saída

Retorne JSON conforme o schema fornecido. Cada operação tem:
- action: "create" | "modify" | "rename"
- filePath: caminho relativo ao diretório project/ do template (ex: "src/app/template/types/template.types.ts")
- content: conteúdo completo (para create e modify)
- reason: explicação breve

Schema:
\`\`\`json
${JSON.stringify(ADAPT_PROJECT_RESPONSE_SCHEMA, null, 2)}
\`\`\`
`;
}

// ---------------------------------------------------------------------------
// Aplicação de operações no filesystem
// ---------------------------------------------------------------------------

function applyOperations(
  projectDir: string,
  operations: AdaptFileOperation[],
): { filesCreated: string[]; filesModified: string[] } {
  const filesCreated: string[] = [];
  const filesModified: string[] = [];

  for (const op of operations) {
    if (!op.filePath) {
      console.warn(`  ⚠️  operação ignorada (filePath ausente): ${JSON.stringify(op).slice(0, 120)}`);
      continue;
    }
    const targetPath = path.join(projectDir, op.filePath);

    switch (op.action) {
      case 'create': {
        const dir = path.dirname(targetPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(targetPath, op.content ?? '', 'utf-8');
        filesCreated.push(op.filePath);
        console.log(`  ✅ criado: ${op.filePath}`);
        console.log(`     → ${op.reason}`);
        break;
      }

      case 'modify': {
        if (!fs.existsSync(targetPath)) {
          // Se o arquivo não existe, cria
          const dir = path.dirname(targetPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(targetPath, op.content ?? '', 'utf-8');
          filesCreated.push(op.filePath);
          console.log(`  ✅ criado (modify→create): ${op.filePath}`);
        } else {
          fs.writeFileSync(targetPath, op.content ?? '', 'utf-8');
          filesModified.push(op.filePath);
          console.log(`  ✏️  modificado: ${op.filePath}`);
        }
        console.log(`     → ${op.reason}`);
        break;
      }

      case 'rename': {
        if (op.newPath && fs.existsSync(targetPath)) {
          const newTarget = path.join(projectDir, op.newPath);
          const dir = path.dirname(newTarget);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.renameSync(targetPath, newTarget);
          filesModified.push(`${op.filePath} → ${op.newPath}`);
          console.log(`  🔄 renomeado: ${op.filePath} → ${op.newPath}`);
          console.log(`     → ${op.reason}`);
        }
        break;
      }
    }
  }

  return { filesCreated, filesModified };
}
