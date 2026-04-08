import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SolicitacaoComponent } from './solicitacao.component';

const routes: Routes = [
  { path: '', component: SolicitacaoComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SolicitacaoRoutingModule { }
