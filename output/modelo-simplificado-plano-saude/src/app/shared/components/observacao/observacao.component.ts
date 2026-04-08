import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ComponentModel } from '@components/component.model';
import { NotificationService } from '@services/utils/notification.service';
import { mostrarErro } from 'src/app/utils/validators.utils';

@Component({
  selector: 'app-observacao',
  templateUrl: './observacao.component.html',
  styleUrl: './observacao.component.scss'
})
export class ObservacaoComponent implements ComponentModel {
  formulario!: FormGroup;
  @Input()
  title: string = "";
  @Input()
  label: string = "";
  @Input()
  maxLenght: number = 500;
  @Input()
  mostrarCard: boolean = true;

  constructor(
    private fb:FormBuilder,
    private notification: NotificationService
  ){
    this.formulario = this.fb.group({
      observacao: [{ value: "", disabled: false }, [Validators.required, Validators.maxLength(this.maxLenght)]]
    })
  }
  mostrarErro(controlName: string, formulario: FormGroup): boolean {
    return mostrarErro(controlName, formulario)
  }
  inicializarComponente(...args: any[]): void {
    throw new Error('Method not implemented.');
  }
  preencherFormulario(observacao: string): void {
    this.formulario.get('observacao')?.setValue(observacao);
  }
  retornaValores():string {
    return this.formulario.get('observacao')?.value || "N/A"
  }
  formularioValido(): boolean {
    for(const campo in this.formulario.controls){
      this.formulario.get(campo)?.markAsDirty();
      this.formulario.get(campo)?.updateValueAndValidity();
    }
    if(!this.formulario.valid && this.formulario.enabled){
      this.notification.formError("Observação é obrigatório.")
    }
    return this.formulario.valid || this.formulario.disabled
  }
  limparValidadores(): void {
    this.formulario.get('observacao')?.clearValidators();
    this.formulario.updateValueAndValidity();
  }
  setarValidadores(): void {
    this.formulario.get('observacao')?.setValidators([Validators.required, Validators.maxLength(this.maxLenght)])
    this.formulario.updateValueAndValidity();
  }
  desabilitarCampos(): void {
    this.formulario.disable();
    this.limparValidadores();
  }
  habilitarCampos(): void {
    this.formulario.enable();
    this.setarValidadores();
  }
}
