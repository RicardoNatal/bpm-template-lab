import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RevisaoRoutingModule } from './revisao-routing.module';
import { RevisaoComponent } from './revisao.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    RevisaoComponent
  ],
  imports: [
    CommonModule,
    RevisaoRoutingModule,
    SharedModule
  ],
  exports: [
    RevisaoComponent
  ]
})
export class RevisaoModule { }
