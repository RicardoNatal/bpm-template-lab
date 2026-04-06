import { Component, ViewChild } from '@angular/core';
import { EtapaModel } from '../etapa.model';
import { WfFormData } from '@core/service/workflow/workflow-cockpit/dist/workflow-cockpit';
import {
  VariaveisProcessoDTO,
  VariaveisProcessoG7DTO,
} from 'src/app/shared/models/variaveis-processo.model';
import { WorkflowService } from '@core/service/workflow/workflow.service';
import { ComponenteLoadingService } from '@services/utils/componente-loading.service';
import {
  EtapaControlService,
} from '@services/utils/etapa-control.service';
import { NotificationService } from '@services/utils/notification.service';
import { DadosSolicitanteComponent } from '@components/dados-solicitante/dados-solicitante.component';
import { BeneficioAtualComponent } from '@components/beneficio-atual/beneficio-atual.component';
import { DadosSolicitacaoComponent } from '@components/dados-solicitacao/dados-solicitacao.component';
import { ObservacaoComponent } from '@components/observacao/observacao.component';

@Component({
  selector: 'app-detalhes',
  templateUrl: './detalhes.component.html',
  styleUrl: './detalhes.component.scss',
})
export class DetalhesComponent implements EtapaModel {
  @ViewChild(DadosSolicitanteComponent, { static: true })
  dadosSolicitanteComponent!: DadosSolicitanteComponent;

  @ViewChild(BeneficioAtualComponent, { static: true })
  beneficioAtualComponent!: BeneficioAtualComponent;

  @ViewChild(DadosSolicitacaoComponent, { static: true })
  dadosSolicitacaoComponent!: DadosSolicitacaoComponent;

  @ViewChild(ObservacaoComponent, { static: true })
  observacaoComponent!: ObservacaoComponent;

  constructor(
    private wfService: WorkflowService,
    private componenteLoadingService: ComponenteLoadingService,
    private etapaControlService: EtapaControlService,
    private notification: NotificationService,
  ) {
    this.etapaControlService.setEtapaAtual('detalhes');
    this.wfService.onSubmit(this.enviarFormulario.bind(this));
  }

  ngOnInit(): void {
    this.componenteLoadingService.iniciarLoadingDinamico();
  }

  ngAfterViewInit(): void {
    this.wfService
      .requestProcessVariables()
      .then((retornoVariaveis) => {
        this.inicializarFormulario(retornoVariaveis as VariaveisProcessoDTO);
      })
      .catch((error) => {
        console.error(error);
        this.notification.parseError('Erro ao buscar variáveis do processo.');
      })
      .finally(() => {
        this.componenteLoadingService.finalizarLoadingDinamico();
      });
  }

  inicializarFormulario(variaveis: VariaveisProcessoDTO): void {
    this.dadosSolicitacaoComponent.preencherFormulario(
      variaveis.dadosSolicitacao,
    );
    this.dadosSolicitacaoComponent.desabilitarCampos();
    this.dadosSolicitanteComponent.preencherFormulario(
      variaveis.dadosSolicitante,
    );
    this.beneficioAtualComponent.preencherFormulario(variaveis.beneficioAtual);
    if (variaveis.observacaoRh) {
      this.observacaoComponent.preencherFormulario(variaveis.observacaoRh);
    }
    this.observacaoComponent.desabilitarCampos();
    this.observacaoComponent.limparValidadores();
  }

  validarFormularios(): boolean {
    // Etapa somente-leitura: nenhum campo precisa ser validado antes do submit.
    return true;
  }

  montaFormData(): VariaveisProcessoG7DTO {
    // Etapa somente-leitura: não há dados novos a persistir.
    return {};
  }

  enviarFormulario(): WfFormData {
    // Etapa somente-leitura: apenas avança o fluxo sem alterar variáveis do processo.
    return { formData: {} };
  }
}
