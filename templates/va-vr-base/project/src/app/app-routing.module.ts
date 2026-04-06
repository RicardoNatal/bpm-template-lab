import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { STEP_ROUTE_MAP, WORKFLOW_ROUTES } from './template/config/workflow-routes.config';

/**
 * Rotas do fluxo BPM.
 *
 * Os paths são derivados de STEP_ROUTE_MAP (template/config/workflow-routes.config.ts).
 * Cada rota injeta `data` com { stepId, mode } via routeData declarado na config,
 * permitindo que os componentes resolvam o step corrente via ActivatedRoute
 * sem depender de parsing de URL.
 *
 * Decisão de arquitetura — rota /revisao:
 * A etapa de revisão reutiliza intencionalmente o SolicitacaoModule.
 * SolicitacaoComponent detecta o modo via route data (stepId='revisao', mode='review').
 * Ver: template/config/workflow-steps.config.ts → step 'revisao' (variantOf: 'solicitacao')
 * Ver: template/config/workflow-routes.config.ts → routeData
 *
 * Limitação: Angular exige imports estáticos para loadChildren; os módulos
 * abaixo não podem ser derivados dinamicamente de WORKFLOW_ROUTES em runtime.
 * Para gerar uma variante, remover a entrada da rota correspondente ao step removido.
 */

/** Lookup rápido de routeData por stepId */
const routeDataFor = (stepId: string) =>
  WORKFLOW_ROUTES.find((r) => r.stepId === stepId)?.routeData ?? {};

const routes: Routes = [
  { path: '', redirectTo: `/${STEP_ROUTE_MAP['detalhes']}`, pathMatch: 'full' },
  {
    path: STEP_ROUTE_MAP['solicitacao'],
    data: routeDataFor('solicitacao'),
    loadChildren: () =>
      import('./modules/solicitacao/solicitacao.module').then(
        (m) => m.SolicitacaoModule,
      ),
  },
  {
    // Variante da solicitação em modo revisão. Reutiliza SolicitacaoModule deliberadamente.
    // Para remover esta etapa em um preset menor, remova esta entrada e sua rota no BPM.
    path: STEP_ROUTE_MAP['revisao'],
    data: routeDataFor('revisao'),
    loadChildren: () =>
      import('./modules/solicitacao/solicitacao.module').then(
        (m) => m.SolicitacaoModule,
      ),
  },
  {
    path: STEP_ROUTE_MAP['analise-rh'],
    data: routeDataFor('analise-rh'),
    loadChildren: () =>
      import('./modules/analise-rh/analise-rh.module').then(
        (m) => m.AnaliseRhModule,
      ),
  },
  {
    path: STEP_ROUTE_MAP['detalhes'],
    data: routeDataFor('detalhes'),
    loadChildren: () =>
      import('./modules/detalhes/detalhes.module').then(
        (m) => m.DetalhesModule,
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
