import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";

export function isRequired(controlName: string, form: FormGroup): boolean {
  if(form.get(controlName)?.hasValidator(Validators.required)){
    return true;
  }
  return false;
}

export function mostrarErro(controlName: string, form: FormGroup): boolean {
  const control = form.get(controlName);
  return !!(
    control &&
    control.errors?.['required'] &&
    (control.touched || control.dirty)
  );
}

export function requiredObjectValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control?.value;

    if (
      (control?.touched || control?.dirty) &&
      control?.enabled &&
      (
        value === null ||
        value === undefined ||
        value === '' ||
        (
          Array.isArray(value) && value.length === 0
        ) ||
        (
          typeof value === 'object' &&
          !Array.isArray(value) &&
          Object.keys(value).length === 0
        )
      )
    ) {
      return { required: true };
    }

    return null;
  };
}
