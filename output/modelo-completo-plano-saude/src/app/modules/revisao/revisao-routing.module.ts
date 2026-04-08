import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RevisaoComponent } from './revisao.component';

const routes: Routes = [
  { path: '', component: RevisaoComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RevisaoRoutingModule { }
