import { DadosSolicitacaoComponent } from '../../shared/components/dados-solicitacao/dados-solicitacao.component';
import { BeneficioAtualComponent } from '../../shared/components/beneficio-atual/beneficio-atual.component';
import { ComponenteLoadingService } from '../../services/utils/componente-loading.service';
import { Component, ViewChild } from '@angular/core';
import {
  EtapaControlService,
} from '@services/utils/etapa-control.service';
import {
  WfFormData,
  WfProcessStep,
} from 'src/app/core/service/workflow/workflow-cockpit/dist/workflow-cockpit';
import { WorkflowService } from 'src/app/core/service/workflow/workflow.service';
import { DadosSolicitanteComponent } from '@components/dados-solicitante/dados-solicitante.component';
import { SeniorXTService } from '@services/requests/seniorXT.service';
import { EtapaModel } from 'src/app/modules/etapa.model';
import {
  VariaveisProcessoDTO,
  VariaveisProcessoG7DTO,
} from '../../shared/models/variaveis-processo.model';
import { NotificationService } from '@services/utils/notification.service';
import {
  DadosColaboradorDTO,
  DadosSolicitante,
} from 'src/app/shared/models/colaboradores.model';
import { InvokeService } from '../../services/requests/invoke/invoke.service';
import { catchError, EMPTY, finalize, take } from 'rxjs';
import { DateUtils } from 'src/app/utils/date-utils';
import { DadosValeModel } from 'src/app/shared/models/vale.model';
import { DadosSolicitacaoModel } from 'src/app/shared/models/solicitacao.model';
import { ObservacaoComponent } from '@components/observacao/observacao.component';

@Component({
  selector: 'app-analise-rh',
  templateUrl: './analise-rh.component.html',
  styleUrl: './analise-rh.component.scss',
})
export class AnaliseRhComponent implements EtapaModel {
  @ViewChild(DadosSolicitanteComponent, { static: true })
  dadosSolicitanteComponent!: DadosSolicitanteComponent;

  @ViewChild(BeneficioAtualComponent, { static: true })
  beneficioAtualComponent!: BeneficioAtualComponent;

  @ViewChild(DadosSolicitacaoComponent, { static: true })
  dadosSolicitacaoComponent!: DadosSolicitacaoComponent;

  @ViewChild(ObservacaoComponent, { static: true })
  observacaoComponent!: ObservacaoComponent;

  nomeSolicitante!: string;
  variaveis!: VariaveisProcessoDTO;

  constructor(
    private wfService: WorkflowService,
    private componenteLoadingService: ComponenteLoadingService,
    private etapaControlService: EtapaControlService,
    private seniorXT: SeniorXTService,
    private invoke: InvokeService,
    private notification: NotificationService,
  ) {
    this.etapaControlService.setEtapaAtual('analise-rh');
    this.wfService.onSubmit(this.enviarFormulario.bind(this));
    this.nomeSolicitante = this.wfService.getUser().username;
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
        this.desabilitarFormulario();
        this.componenteLoadingService.finalizarLoadingDinamico();
      })
      .finally(() => {
        this.componenteLoadingService.finalizarLoadingDinamico();
      });
  }

  inicializarFormulario(variaveis: VariaveisProcessoDTO) {
    this.variaveis = variaveis;

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

    this.observacaoComponent.limparValidadores();
  }

  novoColaborador(dados: DadosColaboradorDTO) {
    console.log(dados);
  }

  validarFormularios(): boolean {
    const observacaoValida = this.observacaoComponent.validarFormulario();

    return observacaoValida;
  }

  montaFormData(): VariaveisProcessoG7DTO {
    return {
      observacaoRh: this.observacaoComponent.retornaValores(),
    };
  }
  async enviarFormulario(step: WfProcessStep): Promise<WfFormData | undefined> {
    try {
      if (step.nextAction.name == 'Revisar') {
        this.observacaoComponent.setarValidadores();
      } else {
        this.observacaoComponent.limparValidadores();
      }

      if (!this.validarFormularios()) {
        this.wfService.abortSubmit();
        return;
      }

      if (step.nextAction.name == 'Aprovar') {
        await this.gravarBeneficio();
      }

      return {
        formData: this.montaFormData(),
      };
    } catch (error) {
      console.error(error);
      this.notification.formError('Erro ao enviar formulário.');
      this.wfService.abortSubmit();
    }
  }

  async gravarBeneficio() {
    const resposta = await this.seniorXT.gravarBeneficio(
      this.variaveis.dadosSolicitante.NNumCad,
      this.variaveis.dadosSolicitante.NNumEmp,
      this.variaveis.dadosSolicitante.NTipCol,
      this.variaveis.codNovoVale,
      this.variaveis.codValeAtual,
    );

    if (resposta.ARetorno != 'OK') {
      throw new Error(resposta ?? 'Erro ao salvar vale.');
    }
  }

  desabilitarFormulario() {
    this.beneficioAtualComponent.desabilitarCampos();
    this.dadosSolicitacaoComponent.desabilitarCampos();
    this.dadosSolicitanteComponent.desabilitarCampos();
  }
}
