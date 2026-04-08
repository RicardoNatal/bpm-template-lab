import { Component, EventEmitter, Output } from '@angular/core';
import { CampoModel } from '@senior-hcm-service-tower/hst-dados/model/campo.model';
import { SearchConfigModel } from '@senior-hcm-service-tower/hst-lookup';
import { ColaboradoresService } from '@services/requests/lookup-services/colaboradores.service';
import { DadosColaborador, DadosColaboradorDTO, DadosSolicitanteDTO } from 'src/app/shared/models/colaboradores.model';
import { ComponentModel } from '../component.model';
import { NotificationService } from '@services/utils/notification.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EtapaControlService, EtapaWorkflow } from '@services/utils/etapa-control.service';
import { requiredObjectValidator } from 'src/app/utils/validators.utils';
import { montaCamposColaborador } from 'src/app/utils/factories/campos-colaborador.factory';

@Component({
  selector: 'app-dados-gestor',
  templateUrl: './dados-gestor.component.html',
  styleUrl: './dados-gestor.component.scss'
})
export class DadosGestorComponent implements ComponentModel {

  @Output()
  emitColaborador: EventEmitter<DadosColaboradorDTO> = new EventEmitter<DadosColaboradorDTO>();

  buscaColabsConfig!: SearchConfigModel;
  camposColaborador: CampoModel[] = []
  nomeGestor: string = "";
  formulario!: FormGroup;
  colaboradorSelecionado: boolean = false;

  constructor(
    private fb: FormBuilder,
    private colabService: ColaboradoresService,
    private notification: NotificationService,
    private etapaService: EtapaControlService
  ){
    this.buscaColabsConfig = this.colabService.retornaConfiguracao();
    this.camposColaborador = montaCamposColaborador(new DadosColaborador());
    this.formulario = this.fb.group({
      dadosColaborador: [{ value: [], disabled: false }, [Validators.required, requiredObjectValidator()]],
    })
  }

  inicializarComponente(dadosSolicitante: DadosSolicitanteDTO){
    this.colabService.definirSolicitante({
      NTipCol: dadosSolicitante.NTipCol,
      NNumEmp: dadosSolicitante.NNumEmp,
      NNumCad: dadosSolicitante.NNumCad,
    });
    this.buscaColabsConfig = this.colabService.retornaConfiguracao();
    this.validaAlteraColaborador();
  }

  validaAlteraColaborador(){
    this.formulario.get('dadosColaborador')?.valueChanges.subscribe(valor => {
      this.colaboradorAlterado(valor); // ou qualquer outra ação
    });
  }

  colaboradorAlterado(event: DadosColaboradorDTO){
    this.colaboradorSelecionado = true;
    this.camposColaborador = montaCamposColaborador(event)
    this.emitColaborador.emit(event);
  }

  mostrarLookup():boolean{
    if(this.etapaService.getEtapaAtual() == EtapaWorkflow.SOLICITACAO){
      return true;
    }
    return false;
  }

  preencherFormulario(dados: DadosColaboradorDTO): void {
    this.colaboradorSelecionado = true;
    this.desabilitarCampos();
    this.limparValidadores();
    this.formulario.patchValue({dadosColaborador:dados});
    this.colaboradorAlterado(dados)
  }

  retornaValores():DadosColaboradorDTO {
    return this.formulario.get('dadosColaborador')?.value
  }

  formularioValido(): boolean {
    for(const campo in this.formulario.controls){
      this.formulario.get(campo)?.markAsTouched();
      this.formulario.get(campo)?.markAsDirty();
      this.formulario.get(campo)?.updateValueAndValidity();
    }
    if(this.formulario.invalid && this.formulario.enabled){
      this.notification.formError("Favor selecione um colaborador e tente novamente.")
      return false;
    }
    return this.formulario.valid || this.formulario.disabled;
  }

  limparValidadores(): void {
    for(const campo in this.formulario.controls){
      this.formulario.get(campo)?.clearValidators()
      this.formulario.get(campo)?.updateValueAndValidity()
    }
  }

  setarValidadores(): void {
    this.formulario.get('dadosColaborador')?.setValidators([Validators.required, requiredObjectValidator()])
  }

  desabilitarCampos(): void {
    this.formulario.disable()
  }

  habilitarCampos(): void {
    this.formulario.enable()
  }
}
