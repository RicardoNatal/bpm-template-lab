import { Component, EventEmitter, HostListener, Input, Optional, Output, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { SelectConfig } from './select.model';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent implements ControlValueAccessor {
  @Input()
  config!: SelectConfig;

  @Input()
  validarOpcoes: boolean = false;

  @Input()
  type: 'select' | 'radio' = 'select';

  @Input()
  orientacao: 'vertical' | 'horizontal' = 'horizontal';

  @Output()
  valueChange = new EventEmitter<any>();

  isMobile = window.innerWidth < 768;

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  value: any;
  isDisabled = false;


  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(@Optional() @Self() public ngControl: NgControl) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  // ControlValueAccessor
  writeValue(obj: any): void {
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  getColSize(size?: number) {
    const base = size ?? 3;
    if(base > 6){
      return base
    }
    return this.isMobile ? base * 2 : base;
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

  onOpen() {
    this.renderDropdown = true;
  }

  onClose() {
    this.renderDropdown = false;
  }

  handleChange(value: any) {
    this.value = value;
    this.onChange(value);
    this.validarOptions();
    this.valueChange.emit(value)
  }

  private validarOptions() {
    if (!this.validarOpcoes || !this.ngControl?.control) return;

    const control = this.ngControl.control;

    const options = this.config.options || [];

    const habilitadas = options.filter(o => !o.disabled);

    if (habilitadas.length === 0) {
      control.setErrors({ semOpcoesDisponiveis: true });
      return;
    }

    const selecionada = options.find(o => o.value === control.value);

    if (selecionada?.disabled) {
      control.setErrors({ opcaoDesabilitada: true });
      return;
    }

    control.updateValueAndValidity({ emitEvent: false });
  }

  get selectedLabel(): string {
    if (!this.config?.options || this.value == null) {
      return 'N/A';
    }

    return (
      this.config.options.find(opt => opt.value === this.value)?.label
      ?? 'N/A'
    );
  }

}
