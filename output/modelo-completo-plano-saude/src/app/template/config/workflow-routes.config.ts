import { RouteConfig, StepId } from '../types/template.types';

// Mapeamento de stepId para path da rota
export const STEP_ROUTE_MAP: Record<StepId, string> = {
  'solicitacao': 'solicitacao',
  'revisao': 'revisao',
  'analise-rh': 'analise-rh',
  'detalhes': 'detalhes'
};

// Configuração completa das rotas do workflow
export const WORKFLOW_ROUTES: RouteConfig[] = [
  {
    stepId: 'solicitacao',
    path: 'solicitacao',
    routeData: {
      stepId: 'solicitacao',
      mode: 'edit'
    }
  },
  {
    stepId: 'revisao',
    path: 'revisao',
    routeData: {
      stepId: 'revisao',
      mode: 'review'
    }
  },
  {
    stepId: 'analise-rh',
    path: 'analise-rh',
    routeData: {
      stepId: 'analise-rh',
      mode: 'edit'
    }
  },
  {
    stepId: 'detalhes',
    path: 'detalhes',
    routeData: {
      stepId: 'detalhes',
      mode: 'readonly'
    }
  }
];