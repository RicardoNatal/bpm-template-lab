import type { BootstrapContext } from './collect-bootstrap-context.js';
import { AI_BOOTSTRAP_RESPONSE_SCHEMA } from './schemas/ai-bootstrap.schema.js';

/**
 * Constrói o prompt completo para a OpenAI (system + user messages).
 *
 * Retorna um array de mensagens no formato da API de chat completions.
 */
export function buildBootstrapPrompt(
  ctx: BootstrapContext,
): Array<{ role: 'system' | 'user'; content: string }> {
  return [
    { role: 'system', content: buildSystemMessage(ctx) },
    { role: 'user', content: buildUserMessage(ctx) },
  ];
}

// ---------------------------------------------------------------------------
// System message
// ---------------------------------------------------------------------------

function buildSystemMessage(ctx: BootstrapContext): string {
  // Incluir referência do meta-source VA/VR como exemplos
  const refSections = Array.from(ctx.referenceMetaSource.entries())
    .map(([name, content]) => `### Arquivo de referência: ${name}\n\`\`\`typescript\n${content}\n\`\`\``)
    .join('\n\n');

  return `Você é um especialista em configuração de fluxos BPM para plataformas low-code.

Sua tarefa é analisar um projeto Angular existente e gerar a configuração de meta-source
que descreve completamente o fluxo BPM, seguindo o padrão de template do BPM Template Lab.

## Conceitos-chave

1. **Template**: descreve um fluxo BPM genérico com todas as etapas, blocos, campos, variáveis de processo e presets (variantes).
2. **Geração subtrativa**: o template define o modelo MÁXIMO. Cada preset seleciona um subconjunto de steps, features, blocks e blockInstances.
3. **meta-source/**: configuração em TypeScript tipada que é a fonte de verdade do template.
4. **meta/**: JSON serializado a partir do meta-source (gerado automaticamente).

## Regras de inferência

- Cada rota Angular lazy-loaded normalmente corresponde a uma **step** do workflow.
- Componentes contêm **blocks** (seções lógicas de UI) com campos de formulário que viram **fieldSchemas**.
- Variáveis de processo (process variables) são dados trafegados entre steps pelo motor BPM.
- **Features** são funcionalidades opcionais (ex: "buscar dados via API", "etapa de revisão").
- **Dependencies** expressam relações entre entidades (ex: step depende de feature).
- **Presets** definem variantes do fluxo. O preset "base" ou "completo" habilita TUDO.

## Formato de saída

Retorne um JSON válido conforme o schema fornecido. Todas as propriedades marcadas como required devem estar presentes.

Para inferências incertas, inclua warnings no campo "warnings" do JSON.
Se não conseguir determinar um valor, use um placeholder descritivo (ex: "TODO: verificar seletor").

## Referência: meta-source do template VA/VR (exemplo funcional)

O template VA/VR abaixo é uma referência REAL de como os arquivos de meta-source devem ser estruturados.
Use-o como exemplo para entender o padrão esperado:

${refSections}

## Referência: manifest.json gerado a partir do meta-source

O manifest.json abaixo é o resultado esperado do sync-meta (TypeScript → JSON):

\`\`\`json
${ctx.referenceManifestJson}
\`\`\`

## JSON Schema da resposta esperada

\`\`\`json
${JSON.stringify(AI_BOOTSTRAP_RESPONSE_SCHEMA, null, 2)}
\`\`\`
`;
}

// ---------------------------------------------------------------------------
// User message
// ---------------------------------------------------------------------------

function buildUserMessage(ctx: BootstrapContext): string {
  const projectFilesSections = Array.from(ctx.projectFiles.entries())
    .map(([relPath, content]) => `### ${relPath}\n\`\`\`typescript\n${content}\n\`\`\``)
    .join('\n\n');

  return `Analise o projeto Angular abaixo e gere a configuração meta-source completa para o template "${ctx.templateId}".

## Arquivos do projeto Angular

${projectFilesSections}

## Instruções específicas

1. Identifique todas as etapas (steps) do fluxo a partir das rotas e componentes.
2. Para cada step, defina o mode correto (edit, readonly, review) baseado no contexto.
3. Mapeie os blocos de UI (componentes reutilizáveis) e suas instâncias em cada step.
4. Extraia os campos de formulário (fieldSchemas) com seus tipos e validadores.
5. Identifique variáveis de processo (process variables) trafegadas entre etapas.
6. Defina features opcionais (integrações, etapas alternativas, etc).
7. Crie pelo menos 2 presets: um completo e um simplificado.
8. Estabeleça as regras de dependência entre entidades.
9. Sempre que houver incerteza, adicione um warning.

Responda SOMENTE com o JSON conforme o schema. Não inclua texto antes ou depois do JSON.
`;
}
