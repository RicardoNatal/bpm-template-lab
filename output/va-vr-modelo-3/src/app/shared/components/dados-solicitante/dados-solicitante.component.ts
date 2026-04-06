import { Component } from '@angular/core';
import { CampoModel } from '@senior-hcm-service-tower/hst-dados/model/campo.model';
import { DadosSolicitante } from 'src/app/shared/models/colaboradores.model';
import {
  ComponenteFormulario,
  ComponenteHabilitavel,
  ComponenteInicializavel,
  ComponenteValidavel,
} from '../component.model';
import { NotificationService } from '@services/utils/notification.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { montaCamposColaborador } from 'src/app/utils/factories/campos-colaborador.factory';

@Component({
  selector: 'app-dados-solicitante',
  templateUrl: './dados-solicitante.component.html',
  styleUrl: './dados-solicitante.component.scss',
})
export class DadosSolicitanteComponent
  implements
    ComponenteFormulario<DadosSolicitante, DadosSolicitante>,
    ComponenteInicializavel<DadosSolicitante>,
    ComponenteHabilitavel,
    ComponenteValidavel
{
  camposSolicitante: CampoModel[] = [];
  formulario!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private notification: NotificationService,
  ) {
    this.formulario = this.fb.group({
      NNumEmp: [{ value: '', disabled: false }, Validators.required],
      NTipCol: [{ value: '', disabled: false }, Validators.required],
      NNumCad: [{ value: '', disabled: false }, Validators.required],
      ANomFun: [{ value: '', disabled: false }, Validators.required],
      ANomEmp: [{ value: '', disabled: false }, Validators.required],
      NCodFil: [{ value: '', disabled: false }, Validators.required],
      ANomFil: [{ value: '', disabled: false }, Validators.required],
      ANomCcu: [{ value: '', disabled: false }, Validators.required],
    });
    this.camposSolicitante = montaCamposColaborador(
      this.formulario.getRawValue(),
    );
  }

  preencherFormulario(dados: DadosSolicitante): void {
    if (!dados) return;
    this.formulario.patchValue(dados);
    this.camposSolicitante = montaCamposColaborador(dados);
  }

  retornaValores(): DadosSolicitante {
    return this.formulario.getRawValue();
  }

  inicializarComponente(dados: DadosSolicitante): void {
    this.formulario.patchValue(dados);
    this.camposSolicitante = montaCamposColaborador(dados);
  }

  validarFormulario(): boolean {
    for (const campo in this.formulario.controls) {
      this.formulario.get(campo)?.markAsDirty();
      this.formulario.get(campo)?.updateValueAndValidity();
    }
    if (this.formulario.invalid && this.formulario.enabled) {
      this.notification.formError(
        'Não foram encontrados os dados do solicitante.',
      );
      return false;
    }
    return true;
  }

  // Campos sempre têm Validators.required (definido no constructor) — sem variação dinâmica.
  limparValidadores(): void {}
  setarValidadores(): void {}

  desabilitarCampos(): void {
    this.formulario.disable();
  }

  habilitarCampos(): void {
    this.formulario.enable();
  }
}

