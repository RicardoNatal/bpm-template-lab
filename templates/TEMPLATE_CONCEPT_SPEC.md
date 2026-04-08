# Template Concept Specification — BPM Template Lab

> Este documento é a **fonte de verdade** usada pela IA para entender o modelo conceitual de
> templates BPM. Todos os comandos de IA (`ai-bootstrap-meta`, `adapt-project`) devem usar
> este documento como autoridade primária — sem necessitar de outro template como referência.
>
> **Não remova ou renomeie este arquivo** — ele é referenciado automaticamente pelo gerador.

---

## 1. Visão geral do modelo

O BPM Template Lab usa **geração subtrativa**: cada template define o modelo **MÁXIMO**
possível (todas as etapas, blocos, campos, integrações). Na hora de gerar um projeto concreto,
um **preset** seleciona um subconjunto desse máximo — o gerador **remove** tudo que não está
habilitado no preset.

```
Template (MÁXIMO)
  └── Preset A (subconjunto 1) → Projeto gerado A
  └── Preset B (subconjunto 2) → Projeto gerado B
```

Isso é o oposto de geração aditiva (onde se parte do zero e se adiciona). Aqui, o template
já contém TUDO; cada variante é definida apenas pelo que habilita/desabilita.

---

## 2. Entidades do meta-source

O meta-source é a fonte de verdade de um template. Ele é composto por arquivos TypeScript
tipados que são convertidos para JSON (via `sync-meta`). Abaixo, cada entidade e seu papel:

### 2.1 Steps (etapas do workflow)

Uma **step** é uma etapa do fluxo BPM — por exemplo: "Solicitação", "Análise RH", "Aprovação".

| Campo            | Tipo                          | Descrição                                                 |
|------------------|-------------------------------|-----------------------------------------------------------|
| `id`             | `string` (kebab-case)         | Identificador único (ex: `solicitacao`, `analise-rh`)     |
| `label`          | `string`                      | Nome legível para exibição                                |
| `route`          | `string`                      | Path da rota Angular (ex: `solicitacao`)                  |
| `componentClass` | `string`                      | Nome da classe Angular do componente principal            |
| `mode`           | `'edit' \| 'readonly' \| 'review'` | Modo padrão da etapa                                |
| `blocks`         | `string[]`                    | IDs dos blocos de UI presentes nesta etapa                |
| `features`       | `string[]`                    | IDs das features ativas nesta etapa                       |
| `optional`       | `boolean`                     | Se a etapa pode ser removida por um preset                |
| `variantOf`      | `string?`                     | Se é variante de outra step (reuso de módulo com modo diferente) |

**Regras:**
- Toda step obrigatória (`optional: false`) está presente em TODOS os presets.
- Steps com `variantOf` reutilizam o mesmo módulo Angular da step referenciada.
- O `mode` define como a step se comporta (formulário editável, visualização, revisão).

### 2.2 Routes (rotas Angular)

Uma **route** mapeia uma step para uma rota lazy-loaded no Angular.

| Campo        | Tipo     | Descrição                                          |
|--------------|----------|----------------------------------------------------|
| `stepId`     | `string` | ID da step correspondente                          |
| `path`       | `string` | Path da rota Angular                               |
| `modulePath` | `string` | Caminho do import lazy-load (ex: `./modules/...`)  |
| `moduleName` | `string` | Nome do módulo Angular exportado                   |
| `routeData`  | `object` | Dados injetados na rota: `{ stepId, mode }`        |

**Regras:**
- Cada step deve ter exatamente uma route correspondente.
- O `routeData` é lido em runtime via `ActivatedRoute.data` para resolver o step atual.
- Routes de steps opcionais são removidas pelo gerador quando o preset não as inclui.

### 2.3 Features (funcionalidades opcionais)

Uma **feature** é uma capacidade do template que pode ser habilitada/desabilitada por preset.

| Campo         | Tipo       | Descrição                                          |
|---------------|------------|----------------------------------------------------|
| `id`          | `string`   | Identificador único (ex: `busca-api`, `revisao`)   |
| `label`       | `string`   | Nome legível                                       |
| `description` | `string`   | Descrição do que a feature controla                |
| `optional`    | `boolean`  | Se pode ser desabilitada (true = sim)              |
| `enabledBy`   | `string[]?`| IDs de outras features das quais depende           |

**Regras:**
- Features com `optional: false` estão sempre ativas.
- Blocos, steps e variáveis de processo podem depender de uma feature.
- Quando uma feature é desabilitada, tudo que depende dela é removido.

### 2.4 Blocks (blocos de UI)

Um **block** é um componente Angular reutilizável que encapsula uma seção lógica da UI
(ex: "Dados do Solicitante", "Parecer do Gestor").

| Campo            | Tipo       | Descrição                                         |
|------------------|------------|---------------------------------------------------|
| `id`             | `string`   | Identificador único (ex: `dados-solicitante`)     |
| `label`          | `string`   | Nome legível                                      |
| `selector`       | `string`   | Seletor Angular do componente (ex: `app-dados-solicitante`) |
| `optional`       | `boolean`  | Se o bloco pode ser removido por preset           |
| `readOnlyInSteps` | `string[]`| Steps onde este bloco é renderizado em modo leitura|

**Regras:**
- Um block é um tipo de componente; pode ter múltiplas instâncias (blockInstances).
- Blocks opcionais podem ser excluídos em presets simplificados.
- `readOnlyInSteps` indica onde o componente deve exibir dados em modo leitura.

### 2.5 Block Instances (instâncias de bloco)

Uma **blockInstance** é a ocorrência concreta de um block em um local específico do template.

| Campo              | Tipo                  | Descrição                                            |
|--------------------|-----------------------|------------------------------------------------------|
| `instanceId`       | `string`              | ID único da instância: `<blockId>-<hostId>`          |
| `blockId`          | `string`              | ID do block que esta instância representa            |
| `hostType`         | `'page' \| 'block'`   | Se está dentro de uma step (page) ou de outro block  |
| `hostId`           | `string`              | ID da step ou block hospedeiro                       |
| `selector`         | `string`              | Seletor Angular usado no template HTML               |
| `templateFile`     | `string`              | Caminho do arquivo .html onde a instância existe     |
| `dataAttribute`    | `string`              | Valor do atributo `data-template-block-instance`     |
| `optional`         | `boolean`             | Se esta instância pode ser removida                  |

**Regras:**
- O `instanceId` segue a convenção `<blockId>-<hostStepId>` (ex: `dados-solicitante-solicitacao`).
- O `dataAttribute` deve corresponder ao `instanceId` para o gerador localizar no HTML.
- O gerador usa o atributo `data-template-block-instance` para remover instâncias desabilitadas.
- Instâncias opcionais devem ser envolvidas com comentários `TEMPLATE:OPTIONAL` no HTML.

### 2.6 Field Schemas (esquemas de campo)

Um **fieldSchema** descreve os campos de formulário dentro de um block.

| Campo               | Tipo                    | Descrição                                       |
|---------------------|-------------------------|-------------------------------------------------|
| `blockId`           | `string`                | Block ao qual os campos pertencem               |
| `fields`            | `Field[]`               | Lista de campos do bloco                        |
| `subBlocks`         | `SubBlock[]?`           | Blocos filhos com seus próprios campos          |

Cada **Field**:

| Campo               | Tipo       | Descrição                                        |
|---------------------|------------|--------------------------------------------------|
| `id`                | `string`   | Identificador único do campo                     |
| `label`             | `string`   | Rótulo do campo                                  |
| `type`              | `string`   | Tipo: `text`, `number`, `date`, `select`, `checkbox`, `textarea` |
| `validators`        | `Validator[]` | Validadores aplicados (ex: `required`, `maxLength`) |
| `optional`          | `boolean`  | Se o campo pode ser removido por preset          |
| `validationVariable`| `boolean`  | Se a presença do campo depende de variável de validação |
| `processVariableKey`| `string?`  | Chave da variável de processo mapeada            |
| `featureDependency` | `string?`  | Feature que controla a presença deste campo      |
| `readOnlyInSteps`   | `string[]` | Steps onde este campo é somente leitura          |

**Regras:**
- Campos com `featureDependency` são removidos quando a feature não está ativa.
- `processVariableKey` vincula o campo a uma variável de processo.
- `validators` são uma lista de `{ name, value? }` (ex: `{ name: 'required' }`, `{ name: 'maxLength', value: 100 }`).

### 2.7 Process Variables (variáveis de processo)

Uma **processVariable** é um dado trafegado entre etapas pelo motor BPM.

| Campo            | Tipo                              | Descrição                                        |
|------------------|-----------------------------------|--------------------------------------------------|
| `key`            | `string`                          | Chave única da variável                          |
| `label`          | `string`                          | Descrição legível                                |
| `type`           | `'string' \| 'number' \| 'boolean' \| 'json'` | Tipo de dado                      |
| `writtenBy`      | `string[]`                        | IDs das steps que escrevem esta variável         |
| `readBy`         | `string[]`                        | IDs das steps que leem esta variável             |
| `notification`   | `boolean`                         | Se é usada em notificações/e-mails               |
| `optional`       | `boolean`                         | Se pode ser removida por preset                  |
| `sourceComponent`| `string?`                         | Componente Angular que origina o valor           |
| `sourceField`    | `string?`                         | Campo do formulário que alimenta esta variável   |
| `requiredFeature`| `string?`                         | Feature que controla a presença desta variável   |

**Regras:**
- `writtenBy` e `readBy` expressam o fluxo de dados entre etapas.
- Variáveis com `requiredFeature` são removidas quando a feature é desabilitada.
- Variáveis opcionais podem ser excluídas em presets simplificados.

### 2.8 Dependencies (relações de dependência)

Uma **dependency** expressa que uma entidade depende de outra.

| Campo         | Tipo     | Descrição                                           |
|---------------|----------|-----------------------------------------------------|
| `source.type` | `string` | Tipo da entidade origem (`step`, `block`, `feature`, etc.) |
| `source.id`   | `string` | ID da entidade origem                               |
| `target.type` | `string` | Tipo da entidade destino                            |
| `target.id`   | `string` | ID da entidade destino                              |
| `description` | `string` | Justificativa da dependência                        |

**Tipos válidos para source/target:** `step`, `route`, `feature`, `block`, `blockInstance`, `field`, `processVariable`.

**Regras:**
- Na geração, se o `target` foi removido, o `source` também deve ser removido (ou vice-versa).
- Dependencies são usadas pelo gerador para validar consistência do preset.
- Exemplos: uma step depende de uma feature; um field depende de um processVariable.

### 2.9 Presets (variantes do workflow)

Um **preset** define uma variante concreta do fluxo.

| Campo                   | Tipo       | Descrição                                       |
|-------------------------|------------|-------------------------------------------------|
| `id`                    | `string`   | Identificador único (ex: `completo`, `basico`)  |
| `label`                 | `string`   | Nome legível                                    |
| `description`           | `string`   | Descrição da variante                           |
| `enabledSteps`          | `string[]` | IDs das steps habilitadas nesta variante        |
| `enabledFeatures`       | `string[]` | IDs das features habilitadas                    |
| `disabledBlocks`        | `string[]` | IDs dos blocks explicitamente desabilitados     |
| `disabledBlockInstances`| `string[]` | IDs das instâncias explicitamente desabilitadas |

**Regras:**
- O preset "completo" ou "base" habilita TODAS as steps e features.
- Steps obrigatórias (`optional: false`) DEVEM estar em `enabledSteps` de todo preset.
- Cada preset deve ser internamente consistente: se uma step é habilitada, suas features e blocos necessários também devem estar habilitados.
- Todo template deve ter pelo menos 2 presets: um completo e um simplificado.

---

## 3. Invariantes do modelo

Estas regras **devem** ser respeitadas em qualquer meta-source válido:

1. **Toda step referenciada em um preset deve existir em `steps[]`.**
2. **Toda feature referenciada em um preset deve existir em `features[]`.**
3. **Todo block referenciado em `steps[].blocks` deve existir em `blocks[]`.**
4. **Toda blockInstance deve referenciar um `blockId` existente em `blocks[]`.**
5. **Toda blockInstance com `hostType: 'page'` deve ter `hostId` correspondendo a uma step existente.**
6. **Todo route deve referenciar uma step existente via `stepId`.**
7. **Uma step com `variantOf` deve referenciar uma step existente.**
8. **`processVariable.writtenBy` e `readBy` devem referenciar steps existentes.**
9. **Dependencies devem referenciar entidades existentes em seus respectivos arrays.**
10. **O preset `baseModel` (referenciado no campo `baseModel` do template) precisa habilitar TODAS as steps e features.**

---

## 4. Regras de inferência (para a IA)

Ao analisar um projeto Angular para gerar o meta-source, a IA deve seguir estas heurísticas:

### 4.1 Inferência de Steps
- Cada **rota lazy-loaded** no `app-routing.module.ts` normalmente corresponde a uma step.
- O `id` da step é derivado do path da rota (kebab-case).
- O `mode` é inferido pelo contexto: formulários editáveis → `edit`; telas de revisão → `review`; telas de visualização → `readonly`.
- Se dois paths carregam o mesmo módulo com modos diferentes, a segunda rota é `variantOf` da primeira.

### 4.2 Inferência de Blocks
- Cada componente Angular em `shared/components/` que aparece no template HTML de uma step é um block.
- O `selector` do componente (ex: `app-dados-solicitante`) define o block.
- Se o mesmo componente aparece em múltiplas steps, ele é reutilizável (pode ter múltiplas blockInstances).

### 4.3 Inferência de Block Instances
- Cada uso de um block em um template HTML gera uma blockInstance.
- O `instanceId` é `<blockId>-<stepId>` (ex: `dados-solicitante-solicitacao`).
- Se o atributo `data-template-block-instance` já existe, use-o como `instanceId`.

### 4.4 Inferência de Fields
- Campos de formulário (inputs, selects, checkboxes, textareas) em componentes de block são fields.
- O `type` é inferido do elemento HTML: `<input type="text">` → `text`, `<select>` → `select`, etc.
- Validadores Angular (Validators.required, Validators.maxLength) viram entries em `validators[]`.

### 4.5 Inferência de Process Variables
- Dados que são escritos em uma step e lidos em outra são variáveis de processo.
- Services que armazenam estado entre etapas indicam process variables.
- DTOs usados em chamadas ao motor BPM são fontes de variáveis de processo.

### 4.6 Inferência de Features
- Chamadas a APIs externas, integrações, comparações de propostas, etc. são features.
- Blocos condicionais (`*ngIf`, `[hidden]`) frequentemente indicam features opcionais.
- Features agrupam funcionalidades que podem ser habilitadas/desabilitadas como unidade.

### 4.7 Inferência de Presets
- O preset "completo" habilita todas as steps e features do template.
- Presets simplificados removem steps opcionais, features opcionais e/ou blocks opcionais.
- A IA deve criar pelo menos 2 presets: um completo e um simplificado.
- Opcionalmente, criar um preset intermediário se fizer sentido no domínio.

### 4.8 Inferência de Dependencies
- Se uma step usa um formulário cujos dados alimentam uma variável de processo lida por outra step, há uma dependência.
- Se um block só faz sentido quando uma feature está ativa, há dependência block → feature.
- Se uma step só existe para suportar uma feature (ex: step de revisão depende da feature "revisao"), há dependência step → feature.

---

## 5. Estrutura de arquivos do meta-source

O meta-source reside em `templates/<template-id>/meta-source/` e contém:

| Arquivo                            | Entidade(s)                    |
|------------------------------------|--------------------------------|
| `workflow-template.manifest.ts`    | Metadados gerais (id, nome, versão, baseModel) |
| `workflow-steps.config.ts`         | `steps[]`                      |
| `workflow-routes.config.ts`        | `routes[]`                     |
| `workflow-presets.config.ts`       | `presets[]`                    |
| `ui-blocks.config.ts`             | `blocks[]`                     |
| `ui-block-instances.config.ts`    | `blockInstances[]`             |
| `field-schemas.config.ts`         | `fieldSchemas[]`               |
| `process-variables.config.ts`     | `processVariables[]`           |
| `dependencies.config.ts`          | `dependencies[]`               |

Cada arquivo exporta uma constante tipada. O `sync-meta` converte esses TypeScript
para JSON em `templates/<template-id>/meta/`.

---

## 6. Pipeline completo de um template

```
1. init-template       → Cria a estrutura de pastas
2. (copiar projeto)    → Coloca o código Angular em project/
3. adapt-project (IA)  → Refatora para conformidade com ANGULAR_PROJECT_STANDARDS.md
4. ai-bootstrap-meta   → IA gera meta-source inicial a partir do projeto
5. (revisão manual)    → Humano corrige inferências da IA
6. sync-meta           → TypeScript → JSON
7. validate-template   → Verifica invariantes
8. generate            → Gera modelo concreto a partir de preset + request
```

---

## 7. Glossário rápido

| Termo              | Definição                                                    |
|--------------------|--------------------------------------------------------------|
| **Template**       | Modelo BPM máximo com todas as possibilidades                |
| **Preset**         | Variante que define um subconjunto do template               |
| **Step**           | Etapa do workflow BPM (ex: Solicitação, Aprovação)           |
| **Route**          | Rota Angular lazy-loaded correspondente a uma step           |
| **Block**          | Componente Angular reutilizável que encapsula UI             |
| **Block Instance** | Ocorrência concreta de um block em uma step específica       |
| **Field Schema**   | Definição de um campo de formulário dentro de um block       |
| **Process Variable** | Dado trafegado entre steps pelo motor BPM                 |
| **Feature**        | Funcionalidade opcional que pode ser habilitada/desabilitada |
| **Dependency**     | Relação de dependência entre duas entidades do template      |
| **meta-source/**   | Fonte de verdade em TypeScript tipado                        |
| **meta/**          | JSON gerado a partir do meta-source                         |
| **Subtrativa**     | Modelo de geração: começa com tudo, remove o que não precisa |
