import { Component, Input, Optional, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { SelectConfig } from './select.model';
import { NotificationService } from '@services/utils/notification.service';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
})
export class SelectComponent implements ControlValueAccessor {
  @Input() config!: SelectConfig;

  value: any;
  isDisabled = false;

  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(
    @Optional() @Self() public ngControl: NgControl,
    private notification: NotificationService,
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  // ControlValueAccessor
  writeValue(obj: any): void {
    console.log(obj);
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  // Funções de validação
  isRequired(): boolean {
    if (!this.ngControl || !this.ngControl.control) return false;
    const validator = this.ngControl.control.validator?.({} as any);
    return validator?.['required'] ?? false;
  }

  showError(): boolean {
    if (!this.ngControl || !this.ngControl.control) return false;
    const control = this.ngControl.control;
    return control.invalid && (control.touched || control.dirty);
  }

  renderDropdown = true;

  validarFormulario(): boolean {
    let selectValido = false;
    if (this.value && this.value != 'N/A') {
      selectValido = true;
    }
    if (!selectValido) {
      this.notification.formError(
        'É obrigatório selecionar um vale.',
      );
    }
    return selectValido;
  }

  onOpen() {
    this.renderDropdown = true;
  }

  onClose() {
    this.renderDropdown = false;
  }

  handleChange(value: any) {
    this.value = value;
    this.onChange(value);
  }

  get selectedLabel(): string {
    if (!this.config?.options || this.value == null) {
      return 'N/A';
    }

    return (
      this.config.options.find((opt) => opt.value === this.value)?.label ??
      'N/A'
    );
  }
}
