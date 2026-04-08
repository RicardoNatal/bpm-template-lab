import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { STEP_ROUTE_MAP, WORKFLOW_ROUTES } from './template/config/workflow-routes.config';

const routeDataFor = (stepId: string) =>
  WORKFLOW_ROUTES.find(r => r.stepId === stepId)?.routeData ?? {};

const routes: Routes = [
  { path: '', redirectTo: '/detalhes', pathMatch: 'full'},
  {
    path: STEP_ROUTE_MAP['solicitacao'],
    data: routeDataFor('solicitacao'),
    loadChildren: () => import('./modules/solicitacao/solicitacao.module').then((m) => m.SolicitacaoModule)
  },
  {
    path: STEP_ROUTE_MAP['revisao'],
    data: routeDataFor('revisao'),
    loadChildren: () => import('./modules/revisao/revisao.module').then((m) => m.RevisaoModule)
  },
  {
    path: STEP_ROUTE_MAP['analise-rh'],
    data: routeDataFor('analise-rh'),
    loadChildren: () => import('./modules/analise-rh/analise-rh.module').then((m) => m.AnaliseRhModule)
  },
  {
    path: STEP_ROUTE_MAP['detalhes'],
    data: routeDataFor('detalhes'),
    loadChildren: () => import('./modules/detalhes/detalhes.module').then(m => m.DetalhesModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }