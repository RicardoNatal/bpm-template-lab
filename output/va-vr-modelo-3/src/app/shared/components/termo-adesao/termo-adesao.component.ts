import { Component } from '@angular/core';
import { ComponentModel } from '@components/component.model';
import { FormControl, Validators } from '@angular/forms';
import { NotificationService } from '@services/utils/notification.service';

@Component({
  selector: 'app-termo-adesao',
  templateUrl: './termo-adesao.component.html',
  styleUrl: './termo-adesao.component.scss',
})
export class TermoAdesaoComponent implements ComponentModel {
  aceite = new FormControl(false, Validators.requiredTrue);

  constructor(private notification: NotificationService) {}
  preencherFormulario(termo: boolean): void {
    this.aceite.setValue(termo);
  }

  inicializarComponente(termo: boolean = false): void {
    this.aceite.reset(termo);
  }

  retornaValores(): boolean {
    return this.aceite.value as boolean;
  }

  validarFormulario(): boolean {
    this.aceite.markAsDirty();
    this.aceite.updateValueAndValidity();

    if (this.aceite.invalid) {
      this.notification.formError(
        'É necessário aceitar os termos para continuar.',
      );
      return false;
    }
    return true;
  }

  limparValidadores(): void {
    this.aceite.clearValidators();
    this.aceite.updateValueAndValidity();
  }

  setarValidadores(): void {
    this.aceite.setValidators(Validators.requiredTrue);
    this.aceite.updateValueAndValidity();
  }

  desabilitarCampos(): void {
    this.aceite.disable();
  }

  habilitarCampos(): void {
    this.aceite.enable();
  }
}
