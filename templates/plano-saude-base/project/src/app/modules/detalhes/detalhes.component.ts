import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EtapaModel } from '../etapa.model';
import { WfFormData } from '@core/service/workflow/workflow-cockpit/dist/workflow-cockpit';
import { VariaveisProcessoDTO, VariaveisProcessoG7DTO } from 'src/app/shared/models/variaveis-processo.model';
import { WorkflowService } from '@core/service/workflow/workflow.service';
import { ComponenteLoadingService } from '@services/utils/componente-loading.service';
import { EtapaControlService, EtapaWorkflow } from '@services/utils/etapa-control.service';
import { NotificationService } from '@services/utils/notification.service';
import { DadosSolicitanteComponent } from '@components/dados-solicitante/dados-solicitante.component';
import { DadosGestorComponent } from '@components/dados-gestor/dados-gestor.component';
import { resolveStepRouteData } from '../../template/helpers/step-resolver';

@Component({
  selector: 'app-detalhes',
  templateUrl: './detalhes.component.html',
  styleUrl: './detalhes.component.scss'
})
export class DetalhesComponent implements EtapaModel {
  @ViewChild(DadosSolicitanteComponent, {static:true})
  dadosSolicitanteComponent!: DadosSolicitanteComponent;

  @ViewChild(DadosGestorComponent, {static:true})
  dadosGestorComponent!: DadosGestorComponent;
  
  solicitanteEhGestor: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private wfService: WorkflowService,
    private componenteLoadingService: ComponenteLoadingService,
    private etapaControlService: EtapaControlService,
    private notification: NotificationService
  ) {
    const routeData = resolveStepRouteData(this.route);
    this.etapaControlService.setEtapaAtual(routeData.stepId as any);
    this.wfService.onSubmit(this.enviarFormulario.bind(this));
  }
   
  ngOnInit(): void {
    this.componenteLoadingService.iniciarLoadingDinamico();
  }

  ngAfterViewInit(): void {
    this.wfService.requestProcessVariables().then(
      (retornoVariaveis) => {
        this.inicializarFormulario(retornoVariaveis as VariaveisProcessoDTO)
      }
    ).catch(
      (error)=>{
        console.error(error)
        this.notification.parseError("Erro ao buscar variáveis do processo.")
      }
    ).finally(
      ()=>{
        this.componenteLoadingService.finalizarLoadingDinamico();
      }
    )
  }
 
  inicializarFormulario(variaveis: VariaveisProcessoDTO): void {
    this.solicitanteEhGestor = variaveis.ehGestor == "S" ? true : false;

    this.dadosSolicitanteComponent.preencherFormulario(variaveis.dadosSolicitante);
    this.dadosSolicitanteComponent.desabilitarCampos();

    if(this.solicitanteEhGestor){
      this.dadosGestorComponent.preencherFormulario(variaveis.dadosColaborador);
      this.dadosGestorComponent.desabilitarCampos();
    }
  }

  formulariosValidos(): boolean {
    throw new Error('Method not implemented.');
  }
  montaFormData(...args: any[]): VariaveisProcessoG7DTO {
    throw new Error('Method not implemented.');
  }
  enviarFormulario(...args: any[]): Promise<WfFormData | undefined> | WfFormData | undefined {
    throw new Error('Method not implemented.');
  }

}