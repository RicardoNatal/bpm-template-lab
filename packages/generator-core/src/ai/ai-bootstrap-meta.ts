import * as path from 'node:path';
import * as fs from 'node:fs';
import { getOpenAIClient, getModel } from './openai-client.js';
import { collectBootstrapContext } from './collect-bootstrap-context.js';
import { writeMetaSourceFromAi } from './write-meta-source-from-ai.js';
import type { AiBootstrapResponse } from './schemas/ai-bootstrap.schema.js';

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

// ---------------------------------------------------------------------------
// Schemas parciais por fase
// ---------------------------------------------------------------------------

const PHASE1_SCHEMA = {
  type: 'object' as const,
  properties: {
    steps: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          id: { type: 'string' as const },
          label: { type: 'string' as const },
          route: { type: 'string' as const },
          componentClass: { type: 'string' as const },
          mode: { type: 'string' as const, enum: ['edit', 'readonly', 'review'] },
          blocks: { type: 'array' as const, items: { type: 'string' as const } },
          features: { type: 'array' as const, items: { type: 'string' as const } },
          optional: { type: 'boolean' as const },
          variantOf: { type: 'string' as const },
        },
        required: ['id', 'label', 'route', 'componentClass', 'mode', 'blocks', 'features', 'optional'],
        additionalProperties: false,
      },
    },
    routes: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          stepId: { type: 'string' as const },
          path: { type: 'string' as const },
          modulePath: { type: 'string' as const },
          moduleName: { type: 'string' as const },
          hasNote: { type: 'string' as const },
          routeData: {
            type: 'object' as const,
            properties: {
              stepId: { type: 'string' as const },
              mode: { type: 'string' as const, enum: ['edit', 'readonly', 'review'] },
            },
            required: ['stepId', 'mode'],
            additionalProperties: false,
          },
        },
        required: ['stepId', 'path', 'modulePath', 'moduleName', 'routeData'],
        additionalProperties: false,
      },
    },
    features: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          id: { type: 'string' as const },
          label: { type: 'string' as const },
          description: { type: 'string' as const },
          optional: { type: 'boolean' as const },
          enabledBy: { type: 'array' as const, items: { type: 'string' as const } },
        },
        required: ['id', 'label', 'description', 'optional'],
        additionalProperties: false,
      },
    },
    warnings: { type: 'array' as const, items: { type: 'string' as const } },
  },
  required: ['steps', 'routes', 'features', 'warnings'],
  additionalProperties: false,
};

const PHASE2_SCHEMA = {
  type: 'object' as const,
  properties: {
    blocks: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          id: { type: 'string' as const },
          label: { type: 'string' as const },
          selector: { type: 'string' as const },
          optional: { type: 'boolean' as const },
          readOnlyInSteps: { type: 'array' as const, items: { type: 'string' as const } },
        },
        required: ['id', 'label', 'selector', 'optional', 'readOnlyInSteps'],
        additionalProperties: false,
      },
    },
    blockInstances: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          instanceId: { type: 'string' as const },
          blockId: { type: 'string' as const },
          hostType: { type: 'string' as const, enum: ['page', 'block'] },
          hostId: { type: 'string' as const },
          selector: { type: 'string' as const },
          templateFile: { type: 'string' as const },
          dataAttribute: { type: 'string' as const },
          optional: { type: 'boolean' as const },
        },
        required: ['instanceId', 'blockId', 'hostType', 'hostId', 'selector', 'templateFile', 'dataAttribute', 'optional'],
        additionalProperties: false,
      },
    },
    fieldSchemas: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          blockId: { type: 'string' as const },
          fields: {
            type: 'array' as const,
            items: {
              type: 'object' as const,
              properties: {
                id: { type: 'string' as const },
                label: { type: 'string' as const },
                type: { type: 'string' as const, enum: ['select', 'checkbox', 'textarea', 'text', 'number', 'date'] },
                validators: { type: 'array' as const, items: { type: 'object' as const, properties: { name: { type: 'string' as const }, value: {} }, required: ['name'], additionalProperties: false } },
                optional: { type: 'boolean' as const },
                validationVariable: { type: 'boolean' as const },
                processVariableKey: { type: 'string' as const },
                featureDependency: { type: 'string' as const },
                readOnlyInSteps: { type: 'array' as const, items: { type: 'string' as const } },
              },
              required: ['id', 'label', 'type', 'validators', 'optional', 'validationVariable', 'readOnlyInSteps'],
              additionalProperties: false,
            },
          },
          subBlocks: {
            type: 'array' as const,
            items: {
              type: 'object' as const,
              properties: {
                blockId: { type: 'string' as const },
                selector: { type: 'string' as const },
                fields: { type: 'array' as const, items: { type: 'object' as const, properties: { id: { type: 'string' as const }, label: { type: 'string' as const }, type: { type: 'string' as const }, validators: { type: 'array' as const, items: { type: 'object' as const, properties: { name: { type: 'string' as const }, value: {} }, required: ['name'], additionalProperties: false } }, optional: { type: 'boolean' as const }, validationVariable: { type: 'boolean' as const }, processVariableKey: { type: 'string' as const }, featureDependency: { type: 'string' as const }, readOnlyInSteps: { type: 'array' as const, items: { type: 'string' as const } } }, required: ['id', 'label', 'type', 'validators', 'optional', 'validationVariable', 'readOnlyInSteps'], additionalProperties: false } },
                optional: { type: 'boolean' as const },
              },
              required: ['blockId', 'selector', 'fields', 'optional'],
              additionalProperties: false,
            },
          },
        },
        required: ['blockId', 'fields'],
        additionalProperties: false,
      },
    },
    warnings: { type: 'array' as const, items: { type: 'string' as const } },
  },
  required: ['blocks', 'blockInstances', 'fieldSchemas', 'warnings'],
  additionalProperties: false,
};

const PHASE3_SCHEMA = {
  type: 'object' as const,
  properties: {
    templateId: { type: 'string' as const },
    name: { type: 'string' as const },
    description: { type: 'string' as const },
    version: { type: 'string' as const },
    baseModel: { type: 'string' as const },
    processVariables: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          key: { type: 'string' as const },
          label: { type: 'string' as const },
          type: { type: 'string' as const, enum: ['string', 'number', 'boolean', 'json'] },
          writtenBy: { type: 'array' as const, items: { type: 'string' as const } },
          readBy: { type: 'array' as const, items: { type: 'string' as const } },
          notification: { type: 'boolean' as const },
          optional: { type: 'boolean' as const },
          sourceComponent: { type: 'string' as const },
          sourceField: { type: 'string' as const },
          requiredFeature: { type: 'string' as const },
        },
        required: ['key', 'label', 'type', 'writtenBy', 'readBy', 'notification', 'optional'],
        additionalProperties: false,
      },
    },
    dependencies: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          source: { type: 'object' as const, properties: { type: { type: 'string' as const, enum: ['step', 'route', 'feature', 'block', 'blockInstance', 'field', 'processVariable'] }, id: { type: 'string' as const } }, required: ['type', 'id'], additionalProperties: false },
          target: { type: 'object' as const, properties: { type: { type: 'string' as const, enum: ['step', 'route', 'feature', 'block', 'blockInstance', 'field', 'processVariable'] }, id: { type: 'string' as const } }, required: ['type', 'id'], additionalProperties: false },
          description: { type: 'string' as const },
        },
        required: ['source', 'target', 'description'],
        additionalProperties: false,
      },
    },
    presets: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          id: { type: 'string' as const },
          label: { type: 'string' as const },
          description: { type: 'string' as const },
          enabledSteps: { type: 'array' as const, items: { type: 'string' as const } },
          enabledFeatures: { type: 'array' as const, items: { type: 'string' as const } },
          disabledBlocks: { type: 'array' as const, items: { type: 'string' as const } },
          disabledBlockInstances: { type: 'array' as const, items: { type: 'string' as const } },
        },
        required: ['id', 'label', 'description', 'enabledSteps', 'enabledFeatures', 'disabledBlocks', 'disabledBlockInstances'],
        additionalProperties: false,
      },
    },
    warnings: { type: 'array' as const, items: { type: 'string' as const } },
  },
  required: ['templateId', 'name', 'description', 'version', 'baseModel', 'processVariables', 'dependencies', 'presets', 'warnings'],
  additionalProperties: false,
};

// ---------------------------------------------------------------------------
// Orquestrador principal
// ---------------------------------------------------------------------------

/**
 * Orquestrador do ai-bootstrap-meta (3 fases para evitar timeout).
 *
 * Fase 1 — routing + TS: infere steps, routes, features
 * Fase 2 — HTML templates: infere blocks, blockInstances, fieldSchemas
 * Fase 3 — services + síntese: infere processVariables, dependencies, presets
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

  const model = getModel();
  const client = getOpenAIClient();
  const totalTokens = { prompt: 0, completion: 0, total: 0 };
  const allWarnings: string[] = [];

  // Separar arquivos por tipo
  const routingFiles = filterFiles(ctx.projectFiles, [/routing\.module\.ts$/, /app-routing/]);
  const componentTsFiles = filterFiles(ctx.projectFiles, [/\.component\.ts$/]);
  const htmlFiles = filterFiles(ctx.projectFiles, [/\.component\.html$/]);
  const serviceFiles = filterFiles(ctx.projectFiles, [/\.service\.ts$/]);

  console.log(`   → ${routingFiles.size} routing, ${componentTsFiles.size} component TS, ${htmlFiles.size} HTML, ${serviceFiles.size} services`);

  const systemMessage = `Você é um especialista em configuração de fluxos BPM para plataformas low-code.
Analise arquivos de um projeto Angular e extraia as informações solicitadas em JSON válido conforme o schema.
Use kebab-case para IDs. Se não tiver certeza de um valor, adicione um warning.
Responda SOMENTE com o JSON. Não inclua texto antes ou depois.`;

  // -------------------------------------------------------------------------
  // Fase 1: Routing + Component TS → steps, routes, features
  // -------------------------------------------------------------------------
  console.log('\n🤖 Fase 1/3: Inferindo steps, routes e features...');

  const phase1Files = mergeMaps(routingFiles, componentTsFiles);
  const phase1Content = filesToMarkdown(phase1Files);

  const phase1Response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: `Analise os arquivos Angular abaixo do template "${templateId}" e retorne steps, routes e features do fluxo BPM.

Para cada step: id (kebab-case), label, route (path URL), componentClass, mode (edit/readonly/review), blocks (IDs dos blocos usados), features (IDs das features desse step), optional.
Para cada route: stepId, path, modulePath (caminho relativo ao loadChildren), moduleName, routeData.
Para features: funcionalidades opcionais como integrações, etapas alternativas, campos extras.

## Arquivos

${phase1Content}

Responda SOMENTE com o JSON conforme o schema.
Schema:
\`\`\`json
${JSON.stringify(PHASE1_SCHEMA, null, 2)}
\`\`\`` },
    ],
    response_format: { type: 'json_schema', json_schema: { name: 'phase1_response', strict: true, schema: PHASE1_SCHEMA } },
    temperature: 0.2,
  }, { timeout: 120_000 });

  const phase1Data = parsePhaseResponse(phase1Response, 'Fase 1');
  if (phase1Data.warnings) allWarnings.push(...phase1Data.warnings);
  totalTokens.prompt += phase1Response.usage?.prompt_tokens ?? 0;
  totalTokens.completion += phase1Response.usage?.completion_tokens ?? 0;
  totalTokens.total += phase1Response.usage?.total_tokens ?? 0;
  console.log(`   ✅ ${phase1Data.steps?.length ?? 0} step(s), ${phase1Data.routes?.length ?? 0} route(s), ${phase1Data.features?.length ?? 0} feature(s)`);

  // -------------------------------------------------------------------------
  // Fase 2: HTML templates → blocks, blockInstances, fieldSchemas
  // -------------------------------------------------------------------------
  console.log('\n🤖 Fase 2/3: Inferindo blocks, blockInstances e fieldSchemas...');

  const stepsContext = JSON.stringify(phase1Data.steps ?? [], null, 2);
  const htmlContent = filesToMarkdown(htmlFiles);

  const phase2Response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: `Analise os templates HTML abaixo do template "${templateId}" e retorne blocks, blockInstances e fieldSchemas.

Steps já inferidos (use os IDs de steps e features):
\`\`\`json
${stepsContext}
\`\`\`

Para blocks: componentes reutilizáveis usados nas etapas (dados-solicitante, observacao, etc).
Para blockInstances: onde cada bloco é instanciado (qual arquivo HTML, qual seletor, qual data-template-block-instance).
Para fieldSchemas: campos de formulário dentro de cada bloco.

## Templates HTML

${htmlContent}

Responda SOMENTE com o JSON conforme o schema.
Schema:
\`\`\`json
${JSON.stringify(PHASE2_SCHEMA, null, 2)}
\`\`\`` },
    ],
    response_format: { type: 'json_schema', json_schema: { name: 'phase2_response', strict: true, schema: PHASE2_SCHEMA } },
    temperature: 0.2,
  }, { timeout: 120_000 });

  const phase2Data = parsePhaseResponse(phase2Response, 'Fase 2');
  if (phase2Data.warnings) allWarnings.push(...phase2Data.warnings);
  totalTokens.prompt += phase2Response.usage?.prompt_tokens ?? 0;
  totalTokens.completion += phase2Response.usage?.completion_tokens ?? 0;
  totalTokens.total += phase2Response.usage?.total_tokens ?? 0;
  console.log(`   ✅ ${phase2Data.blocks?.length ?? 0} block(s), ${phase2Data.blockInstances?.length ?? 0} instance(s), ${phase2Data.fieldSchemas?.length ?? 0} schema(s)`);

  // -------------------------------------------------------------------------
  // Fase 3: Services + síntese → processVariables, dependencies, presets, metadados
  // -------------------------------------------------------------------------
  console.log('\n🤖 Fase 3/3: Inferindo processVariables, dependencies e presets...');

  const servicesContent = filesToMarkdown(serviceFiles);
  const summaryContext = `Steps: ${(phase1Data.steps ?? []).map((s: { id: string }) => s.id).join(', ')}
Features: ${(phase1Data.features ?? []).map((f: { id: string }) => f.id).join(', ')}
Blocks: ${(phase2Data.blocks ?? []).map((b: { id: string }) => b.id).join(', ')}`;

  const phase3Response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: `Analise os services Angular abaixo do template "${templateId}" e gere os metadados finais.

Entidades já inferidas:
${summaryContext}

Para processVariables: variáveis trafegadas entre etapas (chaves dos serviços, dados do formulário).
Para dependencies: relações entre entidades (ex: feature X habilita step Y).
Para presets: crie pelo menos 2 variantes (completo e simplificado).
templateId: "${templateId}", name: nome legível, description: descrição do fluxo, version: "1.0.0", baseModel: ID do preset completo.

## Services

${servicesContent}

Responda SOMENTE com o JSON conforme o schema.
Schema:
\`\`\`json
${JSON.stringify(PHASE3_SCHEMA, null, 2)}
\`\`\`` },
    ],
    response_format: { type: 'json_schema', json_schema: { name: 'phase3_response', strict: true, schema: PHASE3_SCHEMA } },
    temperature: 0.2,
  }, { timeout: 120_000 });

  const phase3Data = parsePhaseResponse(phase3Response, 'Fase 3');
  if (phase3Data.warnings) allWarnings.push(...phase3Data.warnings);
  totalTokens.prompt += phase3Response.usage?.prompt_tokens ?? 0;
  totalTokens.completion += phase3Response.usage?.completion_tokens ?? 0;
  totalTokens.total += phase3Response.usage?.total_tokens ?? 0;
  console.log(`   ✅ ${phase3Data.processVariables?.length ?? 0} variável(is), ${phase3Data.presets?.length ?? 0} preset(s), ${phase3Data.dependencies?.length ?? 0} dependência(s)`);

  // -------------------------------------------------------------------------
  // Merge dos resultados em AiBootstrapResponse completo
  // -------------------------------------------------------------------------
  const aiData: AiBootstrapResponse = {
    templateId: phase3Data.templateId ?? templateId,
    name: phase3Data.name ?? templateId,
    description: phase3Data.description ?? '',
    version: phase3Data.version ?? '1.0.0',
    baseModel: phase3Data.baseModel ?? (phase3Data.presets?.[0]?.id ?? 'modelo-completo'),
    steps: phase1Data.steps ?? [],
    routes: phase1Data.routes ?? [],
    features: phase1Data.features ?? [],
    blocks: phase2Data.blocks ?? [],
    blockInstances: phase2Data.blockInstances ?? [],
    fieldSchemas: phase2Data.fieldSchemas ?? [],
    processVariables: phase3Data.processVariables ?? [],
    dependencies: phase3Data.dependencies ?? [],
    presets: phase3Data.presets ?? [],
    warnings: allWarnings,
  };

  // 6. Escrever meta-source/
  console.log('\n✏️  Escrevendo meta-source/...');
  const filesCreated = writeMetaSourceFromAi(metaSourceDir, aiData);
  console.log(`   → ${filesCreated.length} arquivo(s) criados`);

  if (allWarnings.length > 0) {
    console.log('\n⚠️  Warnings da IA:');
    for (const w of allWarnings) {
      console.log(`   • ${w}`);
    }
  }

  return {
    templateId,
    model,
    filesCreated,
    warnings: allWarnings,
    tokensUsed: totalTokens,
    durationMs: Date.now() - start,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function filterFiles(files: Map<string, string>, patterns: RegExp[]): Map<string, string> {
  const result = new Map<string, string>();
  for (const [relPath, content] of files) {
    if (patterns.some((p) => p.test(relPath))) {
      result.set(relPath, content);
    }
  }
  return result;
}

function mergeMaps(...maps: Map<string, string>[]): Map<string, string> {
  const result = new Map<string, string>();
  for (const m of maps) {
    for (const [k, v] of m) result.set(k, v);
  }
  return result;
}

function filesToMarkdown(files: Map<string, string>): string {
  return Array.from(files.entries())
    .map(([relPath, content]) => `### ${relPath}\n\`\`\`typescript\n${content}\n\`\`\``)
    .join('\n\n');
}

function parsePhaseResponse(response: { choices: Array<{ message: { content: string | null } }>; usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } }, phaseName: string): Record<string, unknown> {
  const choice = response.choices[0];
  if (!choice?.message?.content) {
    console.warn(`   ⚠️  ${phaseName}: resposta vazia`);
    return {};
  }
  try {
    return JSON.parse(choice.message.content) as Record<string, unknown>;
  } catch {
    console.warn(`   ⚠️  ${phaseName}: JSON inválido — ${choice.message.content.slice(0, 200)}`);
    return {};
  }
}
