# BPM Template Lab

Plataforma para criação, configuração e geração automatizada de variantes de projetos BPM (Angular) a partir de templates declarativos com metadados.

O projeto resolve o problema de manter múltiplas variantes de um mesmo fluxo BPM — em vez de forks manuais, um único template gera N variantes por **subtração** do modelo mais completo.

---

## Estrutura do Repositório (Monorepo)

```
bpm-template-lab/
├── apps/
│   ├── dev-studio/              # Interface para desenvolvedores
│   │   ├── index.html           #   Listar templates, montar requests, gerar variantes
│   │   └── data-provider.js     #   Camada de acesso a dados (desacoplada)
│   └── etn-showcase/            # Interface para ETNs consultarem catálogo
│       ├── index.html           #   Catálogo visual com BPMN, comparação de features
│       ├── data-provider.js     #   Camada de acesso a dados (desacoplada)
│       └── image.png            #   Logo
│
├── packages/
│   ├── generator-core/          # Motor de geração BPM (CLI Node.js/TypeScript)
│   │   ├── src/
│   │   │   ├── cli.ts           #   CLI com 6 subcomandos
│   │   │   ├── core/            #   Motor: load → validate → plan → apply
│   │   │   ├── transforms/      #   6 operações subtrativas
│   │   │   ├── commands/        #   Handlers de cada subcomando
│   │   │   ├── scaffolding/     #   Bootstrap de novos templates
│   │   │   ├── sync/            #   Conversão meta-source (TS) → meta (JSON)
│   │   │   ├── ai/              #   Bootstrap assistido por IA (OpenAI)
│   │   │   ├── io/              #   Utilitários de leitura/escrita
│   │   │   ├── types/           #   Tipos internos do gerador
│   │   │   └── reports/         #   Geração de relatórios
│   │   └── package.json
│   ├── registry-core/           # Lógica de acesso ao catálogo
│   │   └── src/
│   │       ├── catalog.ts       #   Ler, validar, escrever, upsert modelos
│   │       ├── catalog-schema.ts#   Schema de validação do catalog.json
│   │       └── index.ts
│   └── shared-types/            # Tipos compartilhados entre apps e packages
│       └── src/
│           ├── catalog.types.ts #   RegistryCatalog, BpmCategory, PublishedModel...
│           ├── template.types.ts#   TemplateSummary, GenerationRequestDTO...
│           └── index.ts
│
├── templates/                   # Templates fonte de fluxos BPM
│   ├── TEMPLATE_ARCHITECTURE.md
│   └── va-vr-base/              # Template real: Troca de VA/VR
│       ├── project/             #   Projeto Angular base completo
│       ├── meta-source/         #   Configuração tipada (TypeScript)
│       └── meta/                #   JSON gerado a partir do meta-source
│
├── registry-data/               # Catálogo publicado (dados, não lógica)
│   ├── catalog.json             #   Catálogo com categorias e modelos
│   └── models/                  #   Metadados copiados de cada modelo publicado
│       ├── va-vr-modelo-1/
│       ├── va-vr-modelo-2/
│       └── va-vr-modelo-3/
│
├── playground/                  # Requests de exemplo para gerar variantes
│   └── requests/
│       ├── modelo-1.json
│       ├── modelo-2.json
│       ├── modelo-3.json
│       └── customizacao-teste.json
│
├── output/                      # Artefatos gerados (temporário, gitignored)
│   ├── va-vr-modelo-1/
│   ├── va-vr-modelo-2/
│   └── va-vr-modelo-3/
│
├── .gitignore
└── README.md
```

### Separação de responsabilidades

| Diretório | Propósito | Persistência |
|-----------|-----------|--------------|
| `apps/` | Interfaces visuais (ETN + Dev) | Código-fonte |
| `packages/` | Lógica reutilizável (gerador, registry, tipos) | Código-fonte |
| `templates/` | Templates BPM fonte | Código-fonte |
| `registry-data/` | Catálogo publicado + metadados | Dados publicados |
| `playground/` | Requests de exemplo | Código-fonte |
| `output/` | Projetos Angular gerados | **Temporário** (gitignored) |

---

## Conceito Principal: Geração Subtrativa

O template define o **modelo máximo** (todas as etapas, blocos, campos, features). Cada variante (**preset**) seleciona um subconjunto — o gerador **remove** o que não faz parte do preset.

```
modelo-3 (completo)      → 4 etapas: Solicitação → Revisão → Análise RH → Detalhes
modelo-2 (intermediário)  → 3 etapas: Solicitação → Análise RH → Detalhes
modelo-1 (básico)         → 2 etapas: Solicitação → Detalhes
```

---

## Fluxo de Uso

### 1. Cadastrar um template

```bash
cd packages/generator-core
npm install

# Bootstrap a partir de um projeto Angular existente
npm run init-template -- --template-id meu-template --from /caminho/do/projeto

# (Opcional) IA gera meta-source com dados reais
npm run ai-bootstrap-meta -- --template-id meu-template    # requer OPENAI_API_KEY

# Revisar e ajustar meta-source/ manualmente
# Marcar HTMLs com data-template-block-instance

# Converter meta-source → meta JSON
npm run sync-meta -- --template-id meu-template

# Validar integridade
npm run validate-template -- --template-id meu-template
```

### 2. Gerar uma variante

```bash
cd packages/generator-core

# Usando um request pronto do playground
npm run generate -- ../../playground/requests/modelo-1.json

# O projeto será gerado em output/va-vr-modelo-1/
```

Exemplo de request JSON:
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

### 3. Publicar no catálogo

```bash
cd packages/generator-core

# Publicar um modelo específico
npm run publish -- va-vr-modelo-1

# Publicar todos os modelos gerados
npm run publish -- --all
```

O comando copia os metadados para `registry-data/models/` e atualiza `registry-data/catalog.json`.

### 4. Consultar o catálogo (ETN Showcase)

Abra `apps/etn-showcase/index.html` em um servidor HTTP local:

```bash
# Opção 1: usando npx
npx serve . -p 3000
# Abrir http://localhost:3000/apps/etn-showcase/

# Opção 2: usando Python
python -m http.server 3000
# Abrir http://localhost:3000/apps/etn-showcase/
```

> **Importante:** O showcase precisa de um servidor HTTP (não funciona abrindo o arquivo diretamente) porque usa `fetch()` para carregar o catálogo.

### 5. Dev Studio (Interface do Desenvolvedor)

Abra `apps/dev-studio/index.html` no mesmo servidor HTTP:

```bash
# Abrir http://localhost:3000/apps/dev-studio/
```

O Dev Studio permite:
- Listar templates disponíveis e seus metadados
- Visualizar presets com fluxo de etapas e features
- Montar requests de geração (JSON editor)
- Carregar requests de exemplo do playground
- Obter comandos CLI para gerar e publicar

---

## Comandos do Generator (referência rápida)

Todos executados a partir de `packages/generator-core/`:

| Comando | Descrição |
|---------|-----------|
| `npm run generate -- <request.json>` | Gerar variante a partir de request |
| `npm run init-template -- --template-id X --from Y` | Bootstrap de novo template |
| `npm run sync-meta -- --template-id X` | Converter meta-source → meta JSON |
| `npm run validate-template -- --template-id X` | Validar integridade do template |
| `npm run ai-bootstrap-meta -- --template-id X` | Bootstrap meta-source via IA |
| `npm run publish -- <slug>` | Publicar modelo no catálogo |
| `npm run publish -- --all` | Publicar todos os modelos |

---

## Operações Subtrativas do Gerador

| Operação | O que faz |
|----------|-----------|
| `disable_step` | Remove etapa do workflow |
| `disable_route` | Remove rota do Angular |
| `disable_feature` | Remove feature e dependências |
| `remove_block_instance` | Remove bloco do HTML |
| `filter_process_variables_by_feature` | Remove variáveis de processo |
| `rename_label` | Renomeia labels em componentes |

---

## Limitações Atuais

- **Dev Studio em modo CLI**: a interface mostra os comandos a executar no terminal, mas não executa diretamente (requer backend/API futura)
- **Templates estáticos**: a lista de templates conhecidos no dev-studio é hardcoded; não há discovery automático
- **Sem autenticação**: todas as interfaces são abertas
- **Sem banco de dados**: catálogo é arquivo JSON no filesystem
- **Sem CI/CD**: geração e publicação são manuais via CLI
- **Mono-repositório**: tudo em um repo; no futuro pode ser separado

---

## Próximos Passos (Pós-hackathon)

1. **API Backend** — Criar servidor Node.js para executar geração/publicação via HTTP (substituindo modo CLI do dev-studio)
2. **Integração GitLab** — Criar repositório automático por variante gerada
3. **Múltiplos templates** — Adicionar outros fluxos BPM além de VA/VR
4. **Discovery de templates** — Listar templates automaticamente a partir do filesystem
5. **Autenticação** — Controle de acesso por perfil (dev vs ETN)
6. **Notificações** — Avisar ETNs quando novos modelos forem publicados
7. **Versionamento** — Histórico de versões por modelo publicado
8. **Separação em repos** — Se necessário, extrair packages em repositórios independentes

---

## Tecnologias

- **Node.js / TypeScript** — Generator core, CLI, módulo IA
- **Angular** — Projetos base e variantes geradas
- **HTML/CSS/JS** — Dev Studio e ETN Showcase (single-page apps estáticas)
- **OpenAI API** — Bootstrap assistido por IA (structured output, JSON Schema)
- **tsx** — Execução de TypeScript sem build prévio

---

## Hackathon 2026

Projeto criado para o hackathon da Senior Sistemas. Foco em demonstrar o fluxo completo:
template armazenado → variante gerada → modelo publicado → ETN consultando catálogo.
