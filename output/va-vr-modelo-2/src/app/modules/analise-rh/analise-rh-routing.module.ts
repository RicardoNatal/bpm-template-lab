import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnaliseRhComponent } from './analise-rh.component';

const routes: Routes = [
  { path: '', component: AnaliseRhComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnaliseRhRoutingModule { }
