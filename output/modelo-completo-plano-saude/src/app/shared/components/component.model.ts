export interface ComponentModel{
  inicializarComponente(...args: any[]):void;
  preencherFormulario(...args: any[]):void;
  retornaValores():any;
  formularioValido():boolean;
  limparValidadores():void;
  setarValidadores():void;
  desabilitarCampos():void;
  habilitarCampos():void;
}
