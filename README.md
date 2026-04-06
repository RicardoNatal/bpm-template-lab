# BPM Template Lab

Plataforma para criação, configuração e geração automatizada de variantes de projetos BPM (Angular) a partir de templates declarativos com metadados.

O projeto resolve o problema de manter múltiplas variantes de um mesmo fluxo BPM — em vez de forks manuais, um único template gera N variantes por **subtração** do modelo mais completo.

## Estrutura do Repositório

```
bpm-template-lab/
├── templates/                    # Templates de fluxos BPM
│   ├── TEMPLATE_ARCHITECTURE.md  # Documentação da arquitetura de templates
│   └── va-vr-base/              # Template real: Troca de VA/VR
│       ├── project/             # Projeto Angular base (código-fonte completo)
│       ├── meta-source/         # Configuração em TypeScript (fonte humana, tipada)
│       └── meta/                # JSON gerado a partir do meta-source (consumo do gerador)
│
├── tools/
│   └── generator-node/          # Gerador BPM (Node.js / TypeScript)
│       ├── src/
│       │   ├── cli.ts           # CLI com 5 subcomandos
│       │   ├── core/            # Motor de geração (load → validate → plan → apply)
│       │   ├── transforms/      # 6 operações subtrativas (disable_step, remove_block, etc.)
│       │   ├── commands/        # Handlers de cada subcomando
│       │   ├── scaffolding/     # Bootstrap de novos templates (init-template)
│       │   ├── sync/            # Conversão meta-source (TS) → meta (JSON)
│       │   ├── ai/              # Bootstrap assistido por IA (OpenAI)
│       │   ├── io/              # Utilitários de leitura/escrita de arquivos
│       │   ├── types/           # Tipos compartilhados
│       │   └── reports/         # Geração de relatórios
│       └── package.json
│
├── playground/
│   └── requests/                # Requests de exemplo para gerar variantes
│       ├── modelo-1.json        # Variante básica (2 etapas)
│       ├── modelo-2.json        # Variante intermediária (3 etapas)
│       └── modelo-3.json        # Variante completa (4 etapas)
│
└── output/                      # Projetos Angular gerados (resultado do generate)
    ├── va-vr-modelo-1/
    ├── va-vr-modelo-2/
    └── va-vr-modelo-3/
```

## Conceito Principal: Geração Subtrativa

O template define o **modelo máximo** (todas as etapas, blocos, campos, features). Cada variante (**preset**) seleciona um subconjunto — o gerador **remove** o que não faz parte do preset.

```
modelo-3 (completo)     →  4 etapas: solicitação → revisão → análise RH → detalhes
modelo-2 (intermediário) →  3 etapas: solicitação → análise RH → detalhes
modelo-1 (básico)        →  2 etapas: solicitação → detalhes
```

## As 3 Camadas de um Template

| Camada | Diretório | Formato | Quem edita | Quem consome |
|--------|-----------|---------|------------|--------------|
| **Código Angular** | `project/` | Angular completo | Desenvolvedor | `generate` (copia como base) |
| **Configuração tipada** | `meta-source/` | TypeScript | Desenvolvedor / IA | `sync-meta` (converte) |
| **Metadados serializados** | `meta/` | JSON | `sync-meta` (gera automaticamente) | `generate` (lê para gerar) |

**Regra fundamental:** o comando `generate` lê **somente** `meta/*.json`. Nunca lê `meta-source/`.

### Arquivos do meta-source (10 arquivos TypeScript)

| Arquivo | Conteúdo |
|---------|----------|
| `template.types.ts` | Tipos: StepId, BlockId, FeatureId, PresetId, interfaces |
| `workflow-steps.config.ts` | Etapas do fluxo BPM (id, label, route, mode, blocks, features) |
| `workflow-routes.config.ts` | Mapa de rotas Angular × steps |
| `workflow-presets.config.ts` | Presets (variantes) com steps/features habilitados |
| `ui-blocks.config.ts` | Blocos de UI reutilizáveis (componentes Angular) |
| `ui-block-instances.config.ts` | Instâncias de blocos em cada step/host |
| `field-schemas.config.ts` | Schemas de campos de formulário com validadores |
| `process-variables.config.ts` | Variáveis de processo trafegadas entre etapas |
| `dependencies.config.ts` | Regras de dependência entre entidades |
| `workflow-template.manifest.ts` | Entrypoint — importa e re-exporta todos os configs |

## Comandos Disponíveis

Todos executados a partir de `tools/generator-node/`:

```bash
cd tools/generator-node
npm install
```

### 1. `init-template` — Bootstrap de novo template

Cria a estrutura inicial de um template a partir de um projeto Angular existente.

```bash
npm run init-template -- --template-id <id> --from <caminho-projeto-angular>
```

Cria `project/`, `meta-source/` (com placeholders), e `meta/`. Infere rotas e componentes por regex.

### 2. `ai-bootstrap-meta` — Bootstrap meta-source via IA

Usa a OpenAI para analisar o código Angular e gerar os 10 arquivos de `meta-source/` com dados reais em vez de placeholders.

```bash
npm run ai-bootstrap-meta -- --template-id <id>
```

Requer `OPENAI_API_KEY` no arquivo `.env` (copiar de `.env.example`). Usa structured output com JSON Schema e o template VA/VR como referência. O resultado ainda requer revisão humana.

### 3. `sync-meta` — Converter meta-source → meta JSON

Carrega os TypeScript de `meta-source/`, resolve imports, e gera os JSONs individuais em `meta/`.

```bash
npm run sync-meta -- --template-id <id>
```

### 4. `validate-template` — Validar template

Verifica integridade referencial: steps × routes × presets × blocks × block-instances × dependencies. Retorna erros, warnings e grau de completude (0-100%).

```bash
npm run validate-template -- --template-id <id>
```

### 5. `generate` — Gerar variante

Lê `meta/*.json`, resolve o preset, monta um plano de operações subtrativas, e gera o projeto Angular final em `output/`.

```bash
npm run generate -- ../../playground/requests/modelo-1.json
```

Exemplo de request:

```json
{
  "templateId": "va-vr-base",
  "presetId": "modelo-1",
  "project": {
    "name": "VA/VR Modelo 1 - Básico",
    "slug": "va-vr-modelo-1"
  },
  "customizations": []
}
```

## Operações Subtrativas do Gerador

O plano de geração aplica estas operações no projeto Angular copiado:

| Operação | O que faz |
|----------|-----------|
| `disable_step` | Remove a etapa do workflow (steps.json, manifest) |
| `disable_route` | Remove a rota do app-routing.module.ts |
| `disable_feature` | Remove a feature e dependências associadas |
| `remove_block_instance` | Remove o bloco do HTML usando `data-template-block-instance` |
| `filter_process_variables_by_feature` | Remove variáveis de processo de features desabilitadas |
| `rename_label` | Renomeia labels em componentes |

## Fluxo Completo para um Novo Template

```
1. init-template          →  Copia projeto e cria estrutura de diretórios
2. ai-bootstrap-meta      →  (Opcional) IA gera meta-source/ com dados reais
3. Revisar meta-source/   →  Ajustar tipos, IDs, labels, validadores
4. Marcar HTMLs            →  Adicionar data-template-block-instance nos HTMLs
5. sync-meta              →  Gerar meta/ (JSON) a partir do meta-source/ (TS)
6. validate-template      →  Verificar integridade referencial
7. Iterar 3-6             →  Até validação passar sem erros
8. Criar request JSON     →  Definir preset e gerar variante
```

## Tecnologias

- **Node.js / TypeScript** — Gerador, CLI, módulo de IA
- **Angular** — Projetos base e variantes geradas
- **OpenAI API** — Bootstrap assistido por IA (structured output, JSON Schema)
- **tsx** — Execução de TypeScript sem build prévio (dev)