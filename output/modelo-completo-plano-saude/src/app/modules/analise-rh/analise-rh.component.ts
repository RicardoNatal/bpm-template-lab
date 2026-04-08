import { WfProcessStep } from './../../core/service/workflow/workflow-cockpit/dist/workflow-cockpit.d';
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DadosGestorComponent } from '@components/dados-gestor/dados-gestor.component';
import { DadosSolicitacaoComponent } from '@components/dados-solicitacao/dados-solicitacao.component';
import { DadosSolicitanteComponent } from '@components/dados-solicitante/dados-solicitante.component';
import { WfFormData } from '@core/service/workflow/workflow-cockpit/dist/workflow-cockpit';
import { WorkflowService } from '@core/service/workflow/workflow.service';
import { ComponenteLoadingService } from '@services/utils/componente-loading.service';
import {
  EtapaControlService,
  EtapaWorkflow,
} from '@services/utils/etapa-control.service';
import { NotificationService } from '@services/utils/notification.service';
import {
  VariaveisProcessoDTO,
  VariaveisProcessoG7DTO,
} from 'src/app/shared/models/variaveis-processo.model';
import { EtapaModel } from '../etapa.model';
import { ObservacaoComponent } from '@components/observacao/observacao.component';
import { SeniorXTService } from '@services/requests/seniorXT.service';
import { DadosPersistenciaSolicitacao } from 'src/app/shared/models/solicitacao.model';
import { resolveStepRouteData } from '../../template/helpers/step-resolver';

@Component({
  selector: 'app-analise-rh',
  templateUrl: './analise-rh.component.html',
  styleUrl: './analise-rh.component.scss',
})
export class AnaliseRhComponent implements EtapaModel {
  @ViewChild(DadosSolicitanteComponent, { static: true })
  dadosSolicitanteComponent!: DadosSolicitanteComponent;

  @ViewChild(DadosSolicitacaoComponent, { static: true })
  dadosSolicitacaoComponent!: DadosSolicitacaoComponent;

  @ViewChild(DadosGestorComponent, { static: true })
  dadosGestorComponent!: DadosGestorComponent;

  @ViewChild(ObservacaoComponent, { static: true })
  observacaoRhComponent!: ObservacaoComponent;

  solicitanteEhGestor: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private wfService: WorkflowService,
    private componenteLoadingService: ComponenteLoadingService,
    private etapaControlService: EtapaControlService,
    private notification: NotificationService,
    private seniorXT: SeniorXTService,
  ) {
    const routeData = resolveStepRouteData(this.route);
    this.etapaControlService.setEtapaAtual(routeData.stepId as any);
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
    this.solicitanteEhGestor = variaveis.ehGestor == 'S' ? true : false;

    this.dadosSolicitanteComponent.preencherFormulario(
      variaveis.dadosSolicitante,
    );
    this.dadosSolicitanteComponent.desabilitarCampos();

    this.dadosSolicitacaoComponent.preencherFormulario(
      variaveis.dadosSolicitacao,
    );
    this.dadosSolicitacaoComponent.desabilitarCampos();

    if (this.solicitanteEhGestor) {
      this.dadosGestorComponent.preencherFormulario(variaveis.dadosColaborador);
      this.dadosGestorComponent.desabilitarCampos();
    }
  }

  formulariosValidos(): boolean {
    return this.dadosSolicitacaoComponent.observacaoComponent.formularioValido();
  }
  montaFormData(): VariaveisProcessoG7DTO {
    const observacaoRh = this.observacaoRhComponent.retornaValores() || '';

    return {
      observacaoRH: observacaoRh,
    };
  }
  async enviarFormulario(step: WfProcessStep): Promise<WfFormData | undefined> {
    try {
      if (!this.formulariosValidos()) {
        this.wfService.abortSubmit();
        return;
      }
      const dadosGravacao: DadosPersistenciaSolicitacao = this.montaDadosGravacao();
      if (step.nextAction.name === 'Aprovar') {
        this.seniorXT.gravarPlanoSaude(dadosGravacao);
      }
      return {
        formData: this.montaFormData(),
      };
    } catch (error) {
      console.error(error);
      this.notification.formError('Erro ao enviar formulário.');
      this.wfService.abortSubmit();
      return;
    }
  }

  montaDadosGravacao(): DadosPersistenciaSolicitacao {
    const solicitante = this.dadosSolicitanteComponent.retornaValores();
    const dadosSolicitacao = this.dadosSolicitacaoComponent.retornaValores() as any;

    const tipoOperacao = dadosSolicitacao?.tipoSolicitacao ?? null;
    const descricaoOperacao =
      this.dadosSolicitacaoComponent.configTipoSolicitacao.options.find(
        (opcao) => opcao.value === tipoOperacao,
      )?.label || '';

    const valorPlanoControle =
      this.dadosSolicitacaoComponent.formulario.getRawValue()?.planos;
    const descricaoPlano =
      this.dadosSolicitacaoComponent.configPlanos.options.find(
        (opcao) => opcao.value === valorPlanoControle,
      )?.label || '';

    const dependentesSelecionados = (dadosSolicitacao?.dependentesSelecionados || [])
      .map((dependente: any) => ({
        id:
          dependente?.id ??
          dependente?.codigo_dependente ??
          dependente?.NCodDep ??
          null,
        nome: dependente?.nome ?? dependente?.ANomDep ?? '',
        selecionado: true,
      }))
      .filter((dependente: any) => dependente.id !== null);

    return {
      solicitante,
      operacao: {
        id: tipoOperacao,
        descricao: descricaoOperacao,
      },
      plano: {
        NCodPla: Number(dadosSolicitacao?.planos ?? 0),
        NCodOem: Number(dadosSolicitacao?.codOemPlanoSelecionado ?? 0),
        ANomPla: descricaoPlano || 'N/A',
      },
      dependentes: dependentesSelecionados,
    };
  }
}