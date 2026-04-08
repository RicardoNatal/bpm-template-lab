# Padrão de Projeto Angular para BPM Template Lab

> Este documento é lido pela IA (comando `adapt-project`) para refatorar projetos Angular
> recém-importados antes do bootstrap de metadados (`ai-bootstrap-meta`).
>
> **Não remova ou renomeie este arquivo** — ele é referenciado automaticamente pelo gerador.

---

## 1. Estrutura de pastas obrigatória

O projeto **deve** conter a seguinte estrutura dentro de `src/app/`:

```
src/app/
  template/
    config/          ← Configs que espelham o meta-source (TS em runtime)
      workflow-steps.config.ts
      workflow-routes.config.ts
      workflow-presets.config.ts
      ui-blocks.config.ts
      ui-block-instances.config.ts
      field-schemas.config.ts
      process-variables.config.ts
      dependencies.config.ts
    types/
      template.types.ts   ← StepId, BlockId, FeatureId, PresetId, interfaces
    helpers/
      step-resolver.ts    ← Utilitários de resolução de step via ActivatedRoute
    manifest/
      workflow-template.manifest.ts  ← Entrypoint do manifesto
  modules/
    <step-id>/            ← Um módulo Angular lazy-loaded por etapa
      <step-id>.module.ts
      <step-id>-routing.module.ts
      <step-id>.component.ts
      <step-id>.component.html
      <step-id>.component.scss
  shared/
    components/           ← Blocos de UI reutilizáveis (cada bloco = 1 componente)
    models/               ← Interfaces/DTOs de variáveis de processo
  services/               ← Services de negócio e utilitários
```

Se o projeto não tiver a pasta `template/`, ela deve ser criada.
Se os módulos não estiverem separados por etapa, devem ser refatorados.

---

## 2. Resolução de step via route data (OBRIGATÓRIO)

### Proibido
```typescript
// ❌ NUNCA fazer isso — impede geração subtrativa
if (this.router.url.startsWith('/revisao')) { ... }
if (this.router.url.includes('analise')) { ... }
const isRevisao = window.location.hash.includes('revisao');
```

### Obrigatório
```typescript
// ✅ Sempre usar o helper do template
import { resolveStepRouteData } from '@template/helpers/step-resolver';

constructor(private route: ActivatedRoute) {
  const routeData = resolveStepRouteData(this.route);
  this.isRevisao = routeData.mode === 'review';
  this.etapaControlService.setEtapaAtual(routeData.stepId);
}
```

O helper `resolveStepRouteData` deve ser criado em `template/helpers/step-resolver.ts`:

```typescript
import { ActivatedRoute } from '@angular/router';
import { StepId, StepMode } from '../types/template.types';

export interface StepRouteData {
  stepId: StepId;
  mode: StepMode;
}

export function resolveStepRouteData(route: ActivatedRoute): StepRouteData {
  const data = route.parent?.snapshot?.data || route.snapshot.data;
  return {
    stepId: data['stepId'] as StepId,
    mode: (data['mode'] as StepMode) || 'edit',
  };
}
```

---

## 3. Lazy loading por etapa (OBRIGATÓRIO)

Cada etapa do BPM **deve** ser um módulo Angular lazy-loaded separado.

### Proibido
```typescript
// ❌ Módulo único com todas as rotas eager
const routes: Routes = [
  { path: 'solicitacao', component: SolicitacaoComponent },
  { path: 'analise-rh', component: AnaliseRhComponent },
];
```

### Obrigatório
```typescript
// ✅ Um módulo lazy por etapa, path derivado de STEP_ROUTE_MAP
import { STEP_ROUTE_MAP, WORKFLOW_ROUTES } from './template/config/workflow-routes.config';

const routeDataFor = (stepId: string) =>
  WORKFLOW_ROUTES.find(r => r.stepId === stepId)?.routeData ?? {};

const routes: Routes = [
  {
    path: STEP_ROUTE_MAP['solicitacao'],
    data: routeDataFor('solicitacao'),
    loadChildren: () =>
      import('./modules/solicitacao/solicitacao.module').then(m => m.SolicitacaoModule),
  },
  // ...
];
```

---

## 4. Marcação de blocos no HTML (OBRIGATÓRIO)

Todo componente de bloco de UI no template HTML **deve** ter o atributo
`data-template-block-instance` para permitir remoção programática pelo gerador.

### Proibido
```html
<!-- ❌ Sem atributo de marcação — gerador não consegue localizar -->
<app-dados-solicitante></app-dados-solicitante>
```

### Obrigatório
```html
<!-- ✅ Bloco obrigatório — sempre presente -->
<app-dados-solicitante
  data-template-block-instance="dados-solicitante-solicitacao">
</app-dados-solicitante>

<!-- ✅ Bloco opcional — envolvido por comentário TEMPLATE:OPTIONAL -->
<!-- TEMPLATE:OPTIONAL block="observacao-rh" instance="observacao-rh-solicitacao" -->
<app-observacao
  data-template-block-instance="observacao-rh-solicitacao"
  [hidden]="!isRevisao">
</app-observacao>
<!-- /TEMPLATE:OPTIONAL -->
```

### Convenção de nomes
- `instanceId`: `<blockId>-<hostStepId>` (ex: `dados-solicitante-solicitacao`)
- `data-template-block-instance`: mesmo valor do `instanceId`

---

## 5. Variáveis de processo tipadas (OBRIGATÓRIO)

Variáveis de processo (dados trafegados entre etapas pelo motor BPM) devem ser
declaradas como interfaces TypeScript em `shared/models/`.

```typescript
// shared/models/variaveis-processo.model.ts
export interface VariaveisProcessoDTO {
  nomeSolicitante: string;
  beneficioAtual: string;
  novoBeneficio: string;
  // ...
}
```

Cada variável deve ter um tipo explícito (`string`, `number`, `boolean`, `json`).
Não usar `any`.

---

## 6. Componentes reutilizáveis como blocos (OBRIGATÓRIO)

Cada seção lógica da UI que aparece em mais de uma etapa **deve** ser um componente
standalone em `shared/components/`.

### Proibido
```html
<!-- ❌ HTML inline replicado em múltiplos templates -->
<div class="card">
  <h3>Dados do Solicitante</h3>
  <p>{{ nome }}</p>
  <!-- 50+ linhas de form fields -->
</div>
```

### Obrigatório
```html
<!-- ✅ Componente reutilizável registrado como bloco -->
<app-dados-solicitante
  data-template-block-instance="dados-solicitante-solicitacao">
</app-dados-solicitante>
```

---

## 7. tsconfig paths (RECOMENDADO)

Para manter imports limpos, configurar paths no tsconfig:

```json
{
  "compilerOptions": {
    "paths": {
      "@template/*": ["src/app/template/*"],
      "@components/*": ["src/app/shared/components/*"],
      "@services/*": ["src/app/services/*"]
    }
  }
}
```

---

## 8. Etapas com variante (variantOf)

Quando duas rotas usam o mesmo componente com comportamentos diferentes (ex: solicitação
normal vs. revisão), a segunda rota deve usar `variantOf` referenciando a etapa original.

O componente resolve o modo via `resolveStepRouteData(route).mode` — nunca por URL.

```typescript
// workflow-steps.config.ts
{
  id: 'revisao',
  label: 'Revisão pelo Solicitante',
  variantOf: 'solicitacao',  // ← indica reuso de módulo
  mode: 'review',
  // ...
}
```

---

## Resumo das alterações que a IA deve aplicar

Ao receber um projeto Angular que NÃO segue estes padrões, a IA deve:

1. **Criar** a pasta `template/` com `config/`, `types/`, `helpers/`, `manifest/`
2. **Criar** `template/types/template.types.ts` com os tipos literais inferidos do projeto
3. **Criar** `template/helpers/step-resolver.ts` com o helper padrão
4. **Criar** `template/config/workflow-routes.config.ts` derivado do routing existente
5. **Refatorar** `app-routing.module.ts` para usar `STEP_ROUTE_MAP` e `routeDataFor()`
6. **Substituir** toda lógica de `router.url.startsWith()` / `router.url.includes()` por `resolveStepRouteData()`
7. **Adicionar** `data-template-block-instance` em todos os componentes de bloco nos templates HTML
8. **Envolver** blocos opcionais com comentários `<!-- TEMPLATE:OPTIONAL -->` / `<!-- /TEMPLATE:OPTIONAL -->`
9. **Separar** módulos lazy por etapa se não estiverem separados
10. **Criar** componentes reutilizáveis para blocos de UI inline duplicados
