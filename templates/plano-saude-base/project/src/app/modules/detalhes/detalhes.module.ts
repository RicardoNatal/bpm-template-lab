import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DetalhesRoutingModule } from './detalhes-routing.module';
import { DetalhesComponent } from './detalhes.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    DetalhesComponent
  ],
  imports: [
    CommonModule,
    DetalhesRoutingModule,
    SharedModule
  ]
})
export class DetalhesModule { }
