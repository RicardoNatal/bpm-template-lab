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
  // Spec conceitual como autoridade primária
  const specSection = ctx.conceptSpec
    ? `## Especificação conceitual do Template (AUTORIDADE PRIMÁRIA)

O documento abaixo define **todas** as entidades, invariantes e regras de inferência do modelo.
Siga-o como referência definitiva para nomes de campos, tipos, convenções e relações entre entidades.

${ctx.conceptSpec}
`
    : '';

  // VA/VR como exemplo secundário opcional
  let refSection = '';
  if (ctx.referenceMetaSource.size > 0) {
    const refSections = Array.from(ctx.referenceMetaSource.entries())
      .map(([name, content]) => `### meta-source/${name}\n\`\`\`typescript\n${content}\n\`\`\``)
      .join('\n\n');

    refSection = `## Exemplo secundário: meta-source de um template existente (VA/VR)

Os arquivos abaixo são de um template já configurado. Use-os **apenas** como exemplo complementar
de como os conceitos da especificação se materializam em código. A especificação conceitual acima
tem precedência sobre qualquer padrão observado aqui.

${refSections}
`;
  }

  let manifestSection = '';
  if (ctx.referenceManifestJson && ctx.referenceManifestJson !== '{}') {
    manifestSection = `## Exemplo: manifest.json gerado a partir do meta-source

O manifest.json abaixo é o resultado esperado do sync-meta (TypeScript → JSON):

\`\`\`json
${ctx.referenceManifestJson}
\`\`\`
`;
  }

  return `Você é um especialista em configuração de fluxos BPM para plataformas low-code.

Sua tarefa é analisar um projeto Angular existente e gerar a configuração de meta-source
que descreve completamente o fluxo BPM, seguindo o padrão de template do BPM Template Lab.

${specSection}
## Formato de saída

Retorne um JSON válido conforme o schema fornecido. Todas as propriedades marcadas como required devem estar presentes.

Para inferências incertas, inclua warnings no campo "warnings" do JSON.
Se não conseguir determinar um valor, use um placeholder descritivo (ex: "TODO: verificar seletor").

${refSection}${manifestSection}
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
