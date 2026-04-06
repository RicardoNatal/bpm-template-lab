import { StepId, StepRouteConfig } from '@template/types/template.types';

/**
 * CONFIGURAÇÃO DE ROTAS × STEPS
 *
 * Fonte única de verdade para o vínculo entre StepId e rota Angular.
 * Inclui routeData que é injetado em route.data no app-routing.module.ts,
 * permitindo que components resolvam o step e mode via ActivatedRoute
 * em vez de ler a URL.
 *
 * Ao adicionar ou renomear uma etapa:
 * 1. Atualizar StepId em template.types.ts
 * 2. Atualizar WORKFLOW_ROUTES aqui
 * 3. app-routing.module.ts já usará o novo valor automaticamente
 */
export const WORKFLOW_ROUTES: StepRouteConfig[] = [
  {
    stepId: 'solicitacao',
    path: 'solicitacao',
    modulePath: './modules/solicitacao/solicitacao.module',
    moduleName: 'SolicitacaoModule',
    routeData: { stepId: 'solicitacao', mode: 'edit' },
  },
  {
    stepId: 'revisao',
    path: 'revisao',
    // Reutiliza SolicitacaoModule intencionalmente. Ver workflow-steps.config.ts → variantOf.
    modulePath: './modules/solicitacao/solicitacao.module',
    moduleName: 'SolicitacaoModule',
    hasNote:
      'Variante de solicitacao em modo review. Mesmo módulo, comportamento distinto via route data.',
    routeData: { stepId: 'revisao', mode: 'review' },
  },
  {
    stepId: 'analise-rh',
    path: 'analise-rh',
    modulePath: './modules/analise-rh/analise-rh.module',
    moduleName: 'AnaliseRhModule',
    routeData: { stepId: 'analise-rh', mode: 'edit' },
  },
  {
    stepId: 'detalhes',
    path: 'detalhes',
    modulePath: './modules/detalhes/detalhes.module',
    moduleName: 'DetalhesModule',
    routeData: { stepId: 'detalhes', mode: 'readonly' },
  },
];

/**
 * Mapa direto de StepId → path para uso em app-routing.module.ts.
 * Garante que paths em routes[] sejam sempre iguais aos declarados nos steps.
 */
export const STEP_ROUTE_MAP: Record<StepId, string> = Object.fromEntries(
  WORKFLOW_ROUTES.map((r) => [r.stepId, r.path]),
) as Record<StepId, string>;

/** Lookup inverso: path → StepId (útil para lógica de loading e mensagens) */
export const ROUTE_STEP_MAP: Record<string, StepId> = Object.fromEntries(
  WORKFLOW_ROUTES.map((r) => [r.path, r.stepId]),
) as Record<string, StepId>;
