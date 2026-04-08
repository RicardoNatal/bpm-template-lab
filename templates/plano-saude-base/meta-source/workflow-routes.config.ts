import { StepId, StepRouteConfig } from './template.types';

/**
 * CONFIGURAÇÃO DE ROTAS × STEPS — Gerado por ai-bootstrap-meta
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
    modulePath: './modules/revisao/revisao.module',
    moduleName: 'RevisaoModule',
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

export const STEP_ROUTE_MAP: Record<StepId, string> = Object.fromEntries(
  WORKFLOW_ROUTES.map((r) => [r.stepId, r.path]),
) as Record<StepId, string>;

export const ROUTE_STEP_MAP: Record<string, StepId> = Object.fromEntries(
  WORKFLOW_ROUTES.map((r) => [r.path, r.stepId]),
) as Record<string, StepId>;
