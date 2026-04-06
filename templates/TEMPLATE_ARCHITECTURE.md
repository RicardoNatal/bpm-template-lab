# Arquitetura Template-Driven — VA/VR

Este documento descreve a arquitetura template-driven introduzida neste projeto.  
O objetivo é preparar o fluxo BPM existente para ser utilizado como **modelo base** a partir do qual variantes menores podem ser geradas de forma segura — manualmente ou por um gerador automatizado.

---

## O que é o Modelo Base

O modelo base é a versão **mais completa** do fluxo BPM (`modelo-3`).  
Ele contém todas as etapas, blocos de UI, features e variáveis de processo.

Variantes menores (`modelo-2`, `modelo-1`) são derivadas **por subtração**: partes do modelo base são desabilitadas ou removidas — nunca criadas do zero.

---

## Camadas de Metadados

O projeto possui **duas camadas distintas** de metadados:

### meta-source/ — Autoria (TypeScript)

Fonte canônica de autoria humana. Arquivos `.ts` tipados com interfaces e imports.
Estes arquivos são editados por desenvolvedores e usados como base para gerar os JSONs.

```
meta-source/
├── template.types.ts              # Interfaces e tipos (contrato de autoria)
├── workflow-template.manifest.ts  # Manifesto TS com imports dos demais configs
├── workflow-steps.config.ts       # Etapas do fluxo
├── workflow-routes.config.ts      # Rotas Angular ↔ steps
├── workflow-presets.config.ts     # Presets: modelo-1, modelo-2, modelo-3
├── ui-blocks.config.ts            # Definição semântica dos blocos de UI
├── ui-block-instances.config.ts   # Instâncias físicas de blocos por template
├── field-schemas.config.ts        # Schemas de campos por bloco
├── process-variables.config.ts    # Variáveis do processo + origens
└── dependencies.config.ts         # Regras de cascata entre entidades
```

> `template.types.ts` permanece aqui como contrato de apoio. Não é dado serializável.  
> `step-resolver.ts` é lógica Angular runtime e reside em `project/src/app/template/helpers/`.

### meta/ — Consumo pelo Gerador (JSON)

Versão serializada e resolvida dos metadados, pronta para leitura por `fs + JSON.parse`.
**O gerador Node deve ler SOMENTE esta pasta.**

```
meta/
├── manifest.json          # Entrypoint — metadados de topo + mapa files
├── steps.json             # Etapas do fluxo
├── routes.json            # Rotas + mapas stepRouteMap / routeStepMap
├── presets.json           # Presets de variantes
├── blocks.json            # Blocos de UI (definição semântica)
├── block-instances.json   # Instâncias físicas de blocos
├── field-schemas.json     # Schemas de campos
├── process-variables.json # Variáveis do processo
├── dependencies.json      # Regras de cascata
└── README.md              # Instruções de consumo
```

### Ponto de entrada para o gerador Node

```js
const manifest = JSON.parse(fs.readFileSync('meta/manifest.json', 'utf-8'));
const steps = JSON.parse(fs.readFileSync(`meta/${manifest.files.steps}`, 'utf-8'));
```

O `manifest.json` expõe: `templateId`, `name`, `version`, `baseModel`, `features`, `allowedOperations`,  
e um mapa `files` que referencia os demais JSONs por nome.

---

## Estrutura da Camada Template no Projeto Angular

Dentro do projeto Angular (`project/src/app/template/`), os arquivos TS servem ao runtime:

```
src/app/template/
├── types/
│   └── template.types.ts              # Interfaces e tipos (contratos completos)
├── config/
│   ├── workflow-steps.config.ts       # Mapa de etapas (modo, componente, variantOf)
│   ├── workflow-presets.config.ts     # Presets: modelo-1, modelo-2, modelo-3
│   ├── workflow-routes.config.ts      # Ligação etapa ↔ rota Angular + routeData
│   ├── ui-blocks.config.ts            # Definição semântica dos blocos de UI
│   ├── ui-block-instances.config.ts   # Ocorrências físicas de blocos por template
│   ├── field-schemas.config.ts        # Schemas de campos para operações add/remove/rename
│   ├── process-variables.config.ts    # Variáveis do processo + componente/campo de origem
│   └── dependencies.config.ts         # Regras de cascata entre entidades
├── helpers/
│   └── step-resolver.ts              # Resolução de step via ActivatedRoute (route data)
└── manifest/
    └── workflow-template.manifest.ts  # Ponto de entrada único — importa todos os configs
```

---

## Etapas do Fluxo (modelo-3)

| ID          | Componente             | Modo     | Opcional |
|-------------|------------------------|----------|----------|
| solicitacao | SolicitacaoComponent   | edit     | não      |
| revisao     | SolicitacaoComponent   | review   | sim      |
| analise-rh  | AnaliseRhComponent     | edit     | sim      |
| detalhes    | DetalhesComponent      | readonly | sim      |

**Decisão de arquitetura — etapa `revisao`:**  
A rota `/revisao` reutiliza intencionalmente o `SolicitacaoModule` e o `SolicitacaoComponent`.  
O componente detecta o modo via **route data** (`routeData: { stepId: 'revisao', mode: 'review' }`) injetado na rota Angular.
Não há mais dependência de `router.url.startsWith()`. O helper `resolveStepRouteData()` resolve step e mode via `ActivatedRoute`.  
Isso está declarado explicitamente no `workflow-steps.config.ts` via `variantOf: 'solicitacao'`.  
Para remover essa etapa em um preset menor, basta não incluir `'revisao'` em `enabledSteps` do preset escolhido —
o gerador usa `STEP_ROUTE_MAP` de `workflow-routes.config.ts` para remover a rota correspondente de `app-routing.module.ts`.

---

## Rotas (workflow-routes.config.ts)

`app-routing.module.ts` usa `STEP_ROUTE_MAP` como única fonte de verdade para todos os `path:` de rota.  
O mapa inverso `ROUTE_STEP_MAP` permite identificar qual `StepId` corresponde a uma URL.

```typescript
// Exemplo
STEP_ROUTE_MAP['analise-rh'] === 'analise-rh'  // valor kebab-case
ROUTE_STEP_MAP['analise-rh'] === 'analise-rh'  // StepId
```

Um gerador que remove a etapa `revisao` deve:
1. Remover a entrada `revisao` de `enabledSteps` no preset.
2. Deletar o bloco `{ path: STEP_ROUTE_MAP['revisao'], ... }` em `app-routing.module.ts`.

---

## Presets

| ID        | Etapas ativas                              | Blocos desabilitados | Instâncias desabilitadas                               |
|-----------|--------------------------------------------|----------------------|--------------------------------------------------------|
| modelo-3  | solicitacao, revisao, analise-rh, detalhes | nenhum               | nenhuma                                                |
| modelo-2  | solicitacao, analise-rh, detalhes          | nenhum               | observacao-rh-solicitacao                              |
| modelo-1  | solicitacao, detalhes                      | observacao-rh        | observacao-rh-solicitacao, ...-analise-rh, ...-detalhes |

Os presets estão em `src/app/template/config/workflow-presets.config.ts`.

---

## Blocos de UI — Definição Semântica vs Instância Física

### Definição semântica (`ui-blocks.config.ts`)

Descreve **o que** um bloco é: selector, em quais etapas aparece, se é editável ou read-only.

| ID                    | Seletor Angular        | Opcional | Read-only em etapas           |
|-----------------------|------------------------|----------|-------------------------------|
| dados-solicitante     | app-dados-solicitante  | não      | revisao, analise-rh, detalhes |
| beneficio-atual       | app-beneficio-atual    | não      | revisao, analise-rh, detalhes |
| dados-solicitacao     | app-dados-solicitacao  | não      | analise-rh, detalhes          |
| observacao-rh         | app-observacao         | sim      | revisao, detalhes             |
| observacao-solicitante| app-observacao         | sim      | revisao, analise-rh, detalhes |
| termo-adesao          | app-termo-adesao       | sim      | revisao, analise-rh, detalhes |

> `app-observacao` é o mesmo seletor Angular para dois blocos semanticamente distintos.
> A distinção física é feita pelas instâncias.

### Instâncias físicas (`ui-block-instances.config.ts`)

Cada ocorrência concreta de um bloco em um template HTML é uma **instância**.  
O `instanceId` segue a convenção `<blockId>-<hostId>`.

Exemplo de instância:
```typescript
{
  instanceId: 'observacao-rh-solicitacao',
  blockId: 'observacao-rh',
  hostStepId: 'solicitacao',
  templateFile: 'src/app/modules/solicitacao/solicitacao.component.html',
  dataAttribute: 'observacao-rh-solicitacao',
  optional: true,
  inputs: { label: 'Observação RH', context: 'rh' },
}
```

O atributo `data-template-block-instance="<instanceId>"` está presente no HTML de todos os templates, permitindo que um gerador localize e manipule cada ocorrência individualmente com uma operação de busca/substituição determinística.

---

## Marcadores HTML para Geradores

Dois tipos de marcadores foram adicionados aos templates HTML:

### 1. Atributo de identidade
```html
<app-dados-solicitante data-template-block-instance="dados-solicitante-solicitacao" ...>
```

### 2. Delimitadores de bloco opcional
```html
<!-- TEMPLATE:OPTIONAL block="observacao-rh" instance="observacao-rh-solicitacao" -->
<app-observacao ...></app-observacao>
<!-- /TEMPLATE:OPTIONAL -->
```

Os delimitadores identificam block e instance. A decisão de quais presets removem cada bloco
vem exclusivamente de `workflow-presets.config.ts` (`disabledBlocks`, `disabledBlockInstances`).
Não há mais `preset-remove-from` no HTML — evita segunda fonte de verdade.  
Um gerador pode fazer um `remove_block` localizando o par de comentários e deletando tudo entre eles.

---

## Schemas de Campos (`field-schemas.config.ts`)

Define os campos de formulário de cada bloco que suportam operações de geração:

| Bloco               | Sub-blocos / Campos                                    |
|---------------------|--------------------------------------------------------|
| dados-solicitante   | NNumCad, ANomFun, NNumEmp, NCodFil, ANomCcu            |
| beneficio-atual     | NCodVal, ADesVal                                       |
| dados-solicitacao   | select-beneficio, termo-adesao, observacao-solicitante |
| observacao-rh       | (campo único: observacaoRh)                            |

Cada campo expõe:
- `fieldName`: `formControlName` no componente Angular
- `label`: rótulo exibido ao usuário
- `type`: `text`, `select`, `textarea`, `checkbox`
- `validators`: lista de constraints (`required`, `maxLength`, etc.)
- `validationVariable`: se `true`, a validação é dinâmica (controlada por variável do processo)

Isso habilita as operações `add_field`, `remove_field`, `change_validation`, `rename_label` no manifesto.

---

## Variáveis do Processo (`process-variables.config.ts`)

As 19 variáveis do processo estão mapeadas com:
- `writtenBy` / `readBy`: quais etapas escrevem/leem cada variável
- `sourceComponent`: classe Angular que produz o valor (ex: `DadosSolicitanteComponent`)
- `sourceField`: `formControlName` ou getter/método que origina o valor
- `requiredFeature`: feature que precisa estar ativa para a variável ser preenchida

Isso permite que um gerador saiba exatamente quais variáveis ficam órfãs quando uma etapa é removida.

---

## Pontos de Variação (operações suportadas)

| Operação           | O que o gerador precisa saber                                         |
|--------------------|-----------------------------------------------------------------------|
| `disable_step`     | `STEP_ROUTE_MAP[stepId]` → rota a remover de `app-routing.module.ts` |
| `disable_route`    | Remover entrada de rota correspondente ao stepId                      |
| `disable_feature`  | `requiredFeature` nas process variables → quais campos omitir        |
| `remove_block`     | `instanceId` no HTML + par `TEMPLATE:OPTIONAL` a deletar             |
| `remove_block_instance` | `instanceId` específico + `dataAttribute` no HTML               |
| `add_field`        | `BlockFieldSchema` do bloco alvo → onde inserir no template/TS       |
| `remove_field`     | `fieldName` no `BlockFieldSchema` + `formControlName` no HTML        |
| `change_validation`| `validators` no `FieldSchema` → atualizar `FormBuilder` e template   |
| `rename_label`     | `label` no `FieldSchema` → substituição de string no HTML            |
| `filter_process_variables_by_feature` | `requiredFeature` em cada variável          |
| `derive_variant_from_preset`          | Preset completo como receita de subtração   |

---

## Como um gerador deve consumir esta estrutura

### Gerador Node (recomendado — usa meta/)

```js
const fs = require('fs');
const path = require('path');
const metaDir = path.resolve(__dirname, 'templates/va-vr-base/meta');
const manifest = JSON.parse(fs.readFileSync(path.join(metaDir, 'manifest.json'), 'utf-8'));

// Carregar sub-arquivos via manifest.files
const steps = JSON.parse(fs.readFileSync(path.join(metaDir, manifest.files.steps), 'utf-8'));
const presets = JSON.parse(fs.readFileSync(path.join(metaDir, manifest.files.presets), 'utf-8'));
const dependencies = JSON.parse(fs.readFileSync(path.join(metaDir, manifest.files.dependencies), 'utf-8'));
// ... demais arquivos
```

### Passos de derivação

1. **Leia o manifesto**: `manifest.json` na pasta `meta/`.
2. **Escolha o preset alvo**: `modelo-1`, `modelo-2` ou `modelo-3`.
3. **Filtre as etapas**: mantenha apenas as listadas em `preset.enabledSteps`.
4. **Filtre os blocos**: remova os listados em `preset.disabledBlocks`:
   - Localize o par `TEMPLATE:OPTIONAL` pelo `instanceId` no HTML.
   - Delete tudo entre (e incluindo) os comentários delimitadores.
5. **Ajuste as rotas**: para cada etapa removida, use `routes.json → stepRouteMap` para encontrar o path e deletar em `app-routing.module.ts`.
6. **Ajuste os módulos**: remova os `loadChildren` e os módulos Angular das etapas removidas.
7. **Filtre as features**: mantenha apenas as listadas em `preset.enabledFeatures`.
8. **Omita variáveis órfãs**: use `processVariables[].requiredFeature` de `process-variables.json` para identificar variáveis que não serão preenchidas.
9. **Percorra dependências**: use `dependencies.json` para cascatas transitivas.

---

## Convenções de Nomenclatura

- `StepId` (canônico) e `EtapaWorkflow` enum (legado/deprecated): valores em kebab-case, iguais ao segmento de rota (`'detalhes'`, `'solicitacao'`, `'revisao'`, `'analise-rh'`).
- `instanceId` de bloco: `<blockId>-<hostStepId>` (ex: `observacao-rh-solicitacao`).
- `data-template-block-instance`: atributo HTML presente em cada instância de bloco.
- Comentários `TEMPLATE:OPTIONAL` / `/TEMPLATE:OPTIONAL`: delimitam blocos removíveis.
- Variável de processo `observacaoRh`: grafada com `h` minúsculo em todo o projeto.
- Serviços canônicos: `src/app/services/utils/` (ComponenteLoadingService, EtapaControlService, NotificationService).

---

## Interfaces do Componente (`component.model.ts`)

`ComponentModel` foi decomposto em 4 interfaces focadas:

| Interface                    | Métodos                                             | Usar quando                                 |
|------------------------------|-----------------------------------------------------|---------------------------------------------|
| `ComponenteFormulario<I,O>`  | `inicializarFormulario()`, `montarOutput()`         | Componente tem FormGroup                    |
| `ComponenteInicializavel<T>` | `inicializarComponente(dados: T)`                   | Componente recebe dados externos            |
| `ComponenteHabilitavel`      | `habilitarCampos()`, `desabilitarCampos()`          | Componente alterna entre edit/read-only     |
| `ComponenteValidavel`        | `validarFormulario()`, `limparValidadores()`, `setarValidadores()` | Componente tem validação dinâmica |

`ComponentModel` (alias de todos os 4) permanece para compatibilidade com código existente mas está marcado como deprecated.

---

## Dependências e Cascatas (`dependencies.config.ts`)

Declara explicitamente as regras de cascata entre entidades:

| Quando removido         | Também remover                              |
|-------------------------|---------------------------------------------|
| feature revisao-pelo-solicitante | step revisao                        |
| feature analise-rh-com-aprovacao | step analise-rh, features gravar-beneficio e observacao-rh |
| feature observacao-rh            | block observacao-rh + todas instâncias    |
| step X                           | route X correspondente                    |
| block observacao-rh              | instâncias + processVariable observacaoRh |

Um gerador percorre estas regras transitivamente para calcular o impacto total de uma remoção.

---

## Resolução de Step via Route Data (`helpers/step-resolver.ts`)

Os componentes não dependem mais de `router.url` para saber em qual step estão.
Cada rota em `app-routing.module.ts` injeta `data: routeDataFor(stepId)` com `{ stepId, mode }` da config.

```typescript
// No componente:
const routeData = resolveStepRouteData(this.route);
this.isRevisao = routeData.mode === 'review';
```

---

## Próximos Passos (não implementados)

- Implementar o gerador Node em `tools/generator-node/` que leia `meta/manifest.json` como entrypoint.
- Criar script de sincronização `meta-source/ → meta/` para manter os JSONs atualizados após edições nos `.ts`.
- Adicionar validação de consistência entre `meta/` e os arquivos do projeto Angular.
- Implementar um `TemplateService` que leia o manifesto em runtime para alimentar um painel de administração de presets.
