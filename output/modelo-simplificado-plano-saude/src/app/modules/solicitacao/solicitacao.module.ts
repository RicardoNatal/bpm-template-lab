import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SolicitacaoRoutingModule } from './solicitacao-routing.module';
import { SolicitacaoComponent } from './solicitacao.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    SolicitacaoComponent
  ],
  imports: [
    CommonModule,
    SolicitacaoRoutingModule,
    SharedModule
  ],
  exports: [
    SolicitacaoComponent
  ]
})
export class SolicitacaoModule { }
