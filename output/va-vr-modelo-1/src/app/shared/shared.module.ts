import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PanelModule } from 'primeng/panel';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { InplaceModule } from 'primeng/inplace';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';

import { InputComponent } from '@senior-hcm-service-tower/hst-input';
import { DadosSolicitanteComponent } from './components/dados-solicitante/dados-solicitante.component';
import { CardComponent } from '@senior-hcm-service-tower/hst-card';
import { DadosComponent } from '@senior-hcm-service-tower/hst-dados';
import { LookupComponent } from '@senior-hcm-service-tower/hst-lookup';
import { UploadFilesComponent } from '@senior-hcm-service-tower/hst-upload-files';
import { MessageComponent } from '@senior-hcm-service-tower/hst-message';
import { SelectComponent } from './components/select/select.component';
import { ObservacaoComponent } from './components/observacao/observacao.component';
import { BlockInteractionDirective } from '../utils/directives/bloqueia-interacao.directive';
import { BeneficioAtualComponent } from './components/beneficio-atual/beneficio-atual.component';
import { SimpleTableComponent } from '@senior-hcm-service-tower/hst-simple-table';
import { DadosSolicitacaoComponent } from './components/dados-solicitacao/dados-solicitacao.component';
import { TermoAdesaoComponent } from './components/termo-adesao/termo-adesao.component';

const NG_COMPONENTS = [
  ButtonModule,
  AvatarModule,
  PanelModule,
  FieldsetModule,
  InplaceModule,
  InputTextModule,
  InputIconModule,
  IconFieldModule,
  DropdownModule,
  CardModule,
  DividerModule,
  CalendarModule,
  InputTextareaModule,
  CheckboxModule,
  RadioButtonModule,
  DialogModule,
  TableModule,
  InputGroupModule,
  InputGroupAddonModule,
  BadgeModule,
  TagModule,
  InputComponent,
  MessageComponent,
  UploadFilesComponent,
  DadosComponent,
  LookupComponent,
  CardComponent,
  SimpleTableComponent,
];

const CUSTOM_COMPONENTS = [
  DadosSolicitanteComponent,
  ObservacaoComponent,
  SelectComponent,
  DadosSolicitacaoComponent,
  BeneficioAtualComponent,
  TermoAdesaoComponent,
  // -- Adicionar componentes criados no shared
];

const DIRECTIVES = [BlockInteractionDirective];

@NgModule({
  declarations: [...CUSTOM_COMPONENTS, ...DIRECTIVES],
  imports: [CommonModule, ...NG_COMPONENTS, ReactiveFormsModule, FormsModule],
  exports: [
    ...NG_COMPONENTS,
    ReactiveFormsModule,
    FormsModule,
    ...CUSTOM_COMPONENTS,
    ...DIRECTIVES,
  ],
})
export class SharedModule {}
