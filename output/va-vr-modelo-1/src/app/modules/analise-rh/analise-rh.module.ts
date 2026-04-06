import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnaliseRhRoutingModule } from './analise-rh-routing.module';
import { AnaliseRhComponent } from './analise-rh.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    AnaliseRhComponent
  ],
  imports: [
    CommonModule,
    AnaliseRhRoutingModule,
    SharedModule
  ],
  exports: [
    AnaliseRhComponent
  ]
})
export class AnaliseRhModule { }
