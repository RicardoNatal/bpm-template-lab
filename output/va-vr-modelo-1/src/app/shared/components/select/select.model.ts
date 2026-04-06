export interface SelectConfig {
  options: {label: string, value: any, disabled?:boolean}[];
  label: string;
  placeholder?: string;
}