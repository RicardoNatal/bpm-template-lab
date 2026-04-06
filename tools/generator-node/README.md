# Gerador BPM — V1.2

Gerador determinístico de variantes de projetos BPM a partir de metadados JSON, com suporte a bootstrap, sincronização de novos templates e **bootstrap assistido por IA (OpenAI)**.

## O que mudou na V1.2

- Novo comando: `ai-bootstrap-meta` — usa OpenAI para gerar meta-source/ a partir do código Angular
- Prompt estruturado com JSON Schema (structured output) e referência VA/VR
- Suporte a `.env` para configuração da API key OpenAI

## Conceitos: project/ vs meta-source/ vs meta/

| Diretório      | Conteúdo                                 | Quem edita        | Quem consome         |
| -------------- | ---------------------------------------- | ----------------- | -------------------- |
| `project/`     | Projeto Angular base (código-fonte)      | Dev / init-template | `generate` (copia)  |
| `meta-source/` | Configs TypeScript (fonte humana)        | Dev (revisão manual) | `sync-meta`        |
| `meta/`        | JSON gerado a partir de meta-source      | `sync-meta` (gera)  | `generate` (lê)    |

**Regra fundamental**: o `generate` lê **SOMENTE** `meta/*.json`. Nunca lê `meta-source/`.

## Instalação

```bash
cd tools/generator-node
npm install
```

## Comandos

### 1. init-template — Bootstrap de novo template

Cria a estrutura de um novo template a partir de um projeto Angular existente.

```bash
npm run init-template -- --template-id plano-saude-base --from ../../../meu-projeto-angular
```

**O que faz:**
- Cria `templates/<id>/project/`, `meta-source/`, `meta/`
- Copia o projeto Angular para `project/`
- Tenta inferir rotas, componentes e módulos do projeto
- Gera arquivos `meta-source/` com placeholders baseados na inferência

**O que infere (melhor esforço):**
- Rotas definidas via `loadChildren` ou `component`
- Nomes de componentes e módulos
- Caminhos de HTMLs

**O que NÃO infere — precisa de revisão manual:**
- Presets reais (gera esqueleto com modelo-completo / modelo-basico)
- Features reais (gera placeholders)
- Block instances (HTML precisa de `data-template-block-instance`)
- Field schemas, process variables, dependencies

### 2. sync-meta — Converter meta-source → meta JSON

```bash
npm run sync-meta -- --template-id plano-saude-base
```

**O que faz:**
- Carrega `meta-source/workflow-template.manifest.ts` via tsx
- Resolve todos os imports TypeScript
- Gera arquivos JSON individuais em `meta/`
- Constrói `manifest.json` com seção `files` apontando para cada JSON

**Pré-requisito**: `meta-source/` deve conter arquivos TypeScript válidos e sem erros de compilação.

### 3. validate-template — Validar template

```bash
npm run validate-template -- --template-id plano-saude-base
```

**O que valida:**
- manifest.json existe e é válido
- Todos os JSONs referenciados existem e parseiam
- stepId de routes existe em steps
- stepId/featureId de presets existe em steps/features
- blockId de block-instances existe em blocks
- templateFile de block-instances existe em project/
- dataAttribute aparece no HTML correspondente
- Dependências não apontam para IDs inexistentes

**Saída:** relatório com erros, warnings e grau de completude (~0-100%).

### 4. generate — Gerar variante (V1, inalterado)

```bash
npm run generate -- ../../playground/requests/modelo-1.json
```

Lê SOMENTE `meta/*.json`. Resolve preset, monta plano subtrativo, gera variante.

### 5. ai-bootstrap-meta — Bootstrap meta-source via IA (novo V1.2)

```bash
npm run ai-bootstrap-meta -- --template-id plano-saude-base
```

**Pré-requisitos:**
- Template já iniciado com `init-template` (precisa de `project/`)
- `OPENAI_API_KEY` configurada em `.env` ou variável de ambiente

**O que faz:**
1. Coleta arquivos relevantes do projeto Angular (rotas, componentes, HTMLs, services)
2. Carrega meta-source VA/VR como referência estrutural do padrão esperado
3. Envia tudo para a OpenAI com JSON Schema (structured output, `strict: true`)
4. Parseia a resposta e gera 10 arquivos TypeScript em `meta-source/`
5. Exibe relatório com tokens usados, warnings e próximos passos

**Modelo padrão:** `gpt-4o` (configurável via `OPENAI_MODEL` em `.env`)

**Configuração do .env:**
```bash
cp .env.example .env
# Edite .env:
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o          # opcional
```

**O que a IA gera (melhor esforço):**
- Steps, routes, features com mode correto
- Blocks e block instances mapeados
- Field schemas com tipos e validadores inferidos
- Process variables com writtenBy/readBy
- Presets (completo + simplificado)
- Dependencies entre entidades
- Warnings para inferências incertas

**O que ainda precisa de revisão manual:**
- Validar IDs e labels gerados
- Ajustar field schemas (validadores, tipos exatos)
- Verificar block instances (seletores, templateFile)
- Adicionar `data-template-block-instance` nos HTMLs
- Revisar process variables e dependencies

## Fluxo completo para um novo template

```text
1. npm run init-template -- --template-id meu-template --from /caminho/projeto
2. npm run ai-bootstrap-meta -- --template-id meu-template    ← NOVO (opcional, acelera passo 2)
3. Revisar e ajustar arquivos em templates/meu-template/meta-source/
4. Adicionar data-template-block-instance nos HTMLs de project/
5. npm run sync-meta -- --template-id meu-template
6. npm run validate-template -- --template-id meu-template
7. Iterar passos 3-6 até validação passar
8. Criar request JSON e gerar variante
```

## Formato do Request (generate)

```json
{
  "templateId": "va-vr-base",
  "presetId": "modelo-1",
  "project": {
    "name": "VA/VR Modelo 1",
    "slug": "va-vr-modelo-1"
  },
  "customizations": []
}
```

## Estrutura do Código

```text
src/
├── cli.ts                             # CLI com subcomandos
├── index.ts                           # Exports públicos
├── commands/
│   ├── generate-command.ts            # Comando generate
│   ├── init-template.ts               # Comando init-template
│   ├── sync-meta.ts                   # Comando sync-meta
│   └── validate-template-command.ts   # Comando validate-template
├── core/                              # Lógica V1 (inalterada)
│   ├── load-template.ts
│   ├── validate-template.ts
│   ├── resolve-preset.ts
│   ├── build-generation-plan.ts
│   ├── apply-generation-plan.ts
│   └── generate-project.ts
├── scaffolding/                       # Bootstrap de templates
│   ├── create-template-structure.ts
│   ├── copy-angular-project.ts
│   ├── create-meta-source-skeleton.ts
│   ├── infer-routes.ts
│   ├── infer-components.ts
│   └── build-init-report.ts
├── sync/                              # meta-source → meta JSON
│   ├── load-meta-source.ts
│   └── serialize-meta.ts
├── transforms/                        # Transforms V1 (inalterados)
├── io/                                # Utilitários de filesystem
├── types/
│   ├── generator.types.ts             # Tipos V1
│   └── meta-source.types.ts           # Tipos V1.1
└── reports/
    ├── generation-report.ts           # Relatório de geração
    ├── validation-report.ts           # Relatório de validação
    └── init-report.ts                 # Relatório de bootstrap
```

## Limitações conhecidas

- `init-template` não adivinha block instances, field schemas, process variables ou dependências
- `sync-meta` depende de `npx tsx` estar disponível no PATH
- `rename_label` continua NOOP no generate V1
- Não implementa `add_field`, `remove_field`, `change_validation`
- Não faz parse AST pesado de TypeScript
- Não builda o Angular — apenas gera cópia com transformações
