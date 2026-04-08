import { Component } from '@angular/core';
import { CampoModel } from '@senior-hcm-service-tower/hst-dados/model/campo.model';
import { DadosSolicitante } from 'src/app/shared/models/colaboradores.model';
import { ComponentModel } from '../component.model';
import { NotificationService } from '@services/utils/notification.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { montaCamposColaborador } from 'src/app/utils/factories/campos-colaborador.factory';

@Component({
  selector: 'app-dados-solicitante',
  templateUrl: './dados-solicitante.component.html',
  styleUrl: './dados-solicitante.component.scss',
})
export class DadosSolicitanteComponent implements ComponentModel {
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
      ANomCCU: [{ value: '', disabled: false }, Validators.required],
      AEhGestor: [{ value: '', disabled: false }, Validators.required],
    });
    this.camposSolicitante = montaCamposColaborador(
      this.formulario.getRawValue(),
    );
  }

  preencherFormulario(dados: DadosSolicitante) {
    this.formulario.patchValue(dados);
    this.camposSolicitante = montaCamposColaborador(dados);
  }

  ehGestor(): boolean {
    if (!this.formulario.get('AEhGestor')?.value) {
      return false;
    }
    if (this.formulario.get('AEhGestor')?.value.toLocaleUpperCase() == 'S') {
      return true;
    }
    return false;
  }

  retornaValores(): DadosSolicitante {
    return this.formulario.getRawValue();
  }

  inicializarComponente(dados: DadosSolicitante): void {
    this.formulario.patchValue(dados);
    this.camposSolicitante = montaCamposColaborador(dados);
  }

  formularioValido(): boolean {
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

  limparValidadores(): void {
    throw new Error('Method not implemented.');
  }
  setarValidadores(): void {
    throw new Error('Method not implemented.');
  }
  desabilitarCampos(): void {
    this.formulario.disable();
  }
  habilitarCampos(): void {
    throw new Error('Method not implemented.');
  }

  switchGestor(forceTrue: boolean = false): void {
    const control = this.formulario.get('AEhGestor');
    if (!control) return;

    if (forceTrue) {
      control.setValue('S');
      return;
    }

    control.setValue(control.value === 'S' ? 'N' : 'S');
  }
}
