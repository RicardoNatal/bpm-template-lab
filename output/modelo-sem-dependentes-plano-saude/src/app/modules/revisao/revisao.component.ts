import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DadosGestorComponent } from '@components/dados-gestor/dados-gestor.component';
import { DadosSolicitacaoComponent } from '@components/dados-solicitacao/dados-solicitacao.component';
import { DadosSolicitanteComponent } from '@components/dados-solicitante/dados-solicitante.component';
import { ObservacaoComponent } from '@components/observacao/observacao.component';
import { WfFormData } from '@core/service/workflow/workflow-cockpit/dist/workflow-cockpit';
import { WorkflowService } from '@core/service/workflow/workflow.service';
import { ComponenteLoadingService } from '@services/utils/componente-loading.service';
import { EtapaControlService, EtapaWorkflow } from '@services/utils/etapa-control.service';
import { NotificationService } from '@services/utils/notification.service';
import { resolveStepRouteData } from '@template/helpers/step-resolver';
import { DadosColaboradorDTO, DadosSolicitanteDTO } from 'src/app/shared/models/colaboradores.model';
import { VariaveisProcessoDTO, VariaveisProcessoG7DTO } from 'src/app/shared/models/variaveis-processo.model';
import { DadosPlano } from 'src/app/shared/models/plano.model';
import { DateUtils } from 'src/app/utils/date-utils';
import { EtapaModel } from '../etapa.model';

@Component({
  selector: 'app-revisao',
  templateUrl: './revisao.component.html',
  styleUrl: './revisao.component.scss',
})
export class RevisaoComponent implements EtapaModel {
  @ViewChild(DadosSolicitanteComponent, { static: true })
  dadosSolicitanteComponent!: DadosSolicitanteComponent;

  @ViewChild(DadosSolicitacaoComponent, { static: true })
  dadosSolicitacaoComponent!: DadosSolicitacaoComponent;

  @ViewChild(DadosGestorComponent, { static: true })
  dadosGestorComponent!: DadosGestorComponent;

  @ViewChild('observacaoRhComponent', { static: true })
  observacaoRhComponent!: ObservacaoComponent;

  nomeSolicitante!: string;
  solicitanteEhGestor: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private wfService: WorkflowService,
    private componenteLoadingService: ComponenteLoadingService,
    private etapaControlService: EtapaControlService,
    private notification: NotificationService,
  ) {
    const routeData = resolveStepRouteData(this.route);
    this.etapaControlService.setEtapaAtual(EtapaWorkflow.DETALHES);
    this.wfService.onSubmit(this.enviarFormulario.bind(this));
    this.nomeSolicitante = this.wfService.getUser().username || '';
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
    this.nomeSolicitante = variaveis.nomeSolicitante || this.nomeSolicitante;
    this.solicitanteEhGestor = variaveis.ehGestor === 'S';

    this.dadosSolicitanteComponent.preencherFormulario(variaveis.dadosSolicitante);
    this.dadosSolicitanteComponent.desabilitarCampos();

    if (this.solicitanteEhGestor) {
      this.dadosGestorComponent.preencherFormulario(
        variaveis.dadosColaborador as DadosColaboradorDTO,
      );
      this.dadosGestorComponent.desabilitarCampos();
    }

    const dadosSolicitacao = (variaveis as any).dadosSolicitacao || {};
    const planosDisponiveis = Array.isArray(dadosSolicitacao.planosDisponiveis)
      ? dadosSolicitacao.planosDisponiveis
      : [];

    if (planosDisponiveis.length > 0) {
      const planos = planosDisponiveis.map(
        (plano: any): DadosPlano => ({
          NCodPla: Number(plano?.codigoPlano ?? 0),
          ANomPla: String(plano?.descricao ?? 'N/A'),
          NCodOem: Number(plano?.codOem ?? 0),
        }),
      );
      this.dadosSolicitacaoComponent.inicializarComponente(planos);
    }

    this.dadosSolicitacaoComponent.preencherFormulario({
      ...dadosSolicitacao,
      dependentesDisponiveis:
        dadosSolicitacao.dependentes,
    });
    this.dadosSolicitacaoComponent.habilitarCampos();

    const observacaoRh = (variaveis as any).observacaoRh || '';
    this.observacaoRhComponent.preencherFormulario(observacaoRh);
    this.observacaoRhComponent.desabilitarCampos();
  }

  ehGestor(): boolean {
    return this.solicitanteEhGestor;
  }

  formulariosValidos(): boolean {
    const solicitanteValido = this.dadosSolicitanteComponent.formularioValido();
    const gestorValido = this.ehGestor()
      ? this.dadosGestorComponent.formularioValido()
      : true;
    const solicitacaoValida = this.dadosSolicitacaoComponent.formularioValido();

    return solicitanteValido && gestorValido && solicitacaoValida;
  }

  montaFormData(): VariaveisProcessoG7DTO {
    const solicitante: DadosSolicitanteDTO =
      this.dadosSolicitanteComponent.retornaValores();
    const colaborador: DadosColaboradorDTO = this.ehGestor()
      ? this.dadosGestorComponent.retornaValores()
      : this.dadosSolicitanteComponent.retornaValores();

    const dadosSolicitacao = this.dadosSolicitacaoComponent.retornaValores();
    const observacaoSolicitacao =
      this.dadosSolicitacaoComponent.observacaoComponent.retornaValores();

    const dadosSolicitacaoPayload = {
      operacaoEscolhida: dadosSolicitacao.tipoSolicitacao,
      planoSelecionado: {
        codigoPlano: dadosSolicitacao.planos,
        codOem: dadosSolicitacao.codOemPlanoSelecionado,
      },
      dependentesSelecionados: dadosSolicitacao.dependentesSelecionados,
      dependentesDisponiveis: dadosSolicitacao.dependentesFiltrados,
      totalDependentesDisponiveis: dadosSolicitacao.totalRegistros,
      observacao: observacaoSolicitacao,
    };

    return {
      nomeSolicitante: this.nomeSolicitante,
      dadosSolicitante: JSON.stringify(solicitante),
      dadosColaborador: JSON.stringify(colaborador),
      dadosSolicitacao: JSON.stringify(dadosSolicitacaoPayload),
      ehGestor: this.dadosSolicitanteComponent.ehGestor() ? 'S' : 'N',

      nomeMatriculaSol: `${solicitante.NNumCad} - ${solicitante.ANomFun}`,
      codNomeEmpresaSol: `${solicitante.NNumEmp} - ${solicitante.ANomEmp}`,
      codNomeFilialSol: `${solicitante.NCodFil} - ${solicitante.ANomFil}`,
      centroCustoSol: `${solicitante.ANomCCU}`,
      nomeMatriculaCol: `${colaborador.NNumCad} - ${colaborador.ANomFun}`,
      codNomeEmpresaCol: `${colaborador.NNumEmp} - ${colaborador.ANomEmp}`,
      codNomeFilialCol: `${colaborador.NCodFil} - ${colaborador.ANomFil}`,
      centroCustoCol: `${colaborador.ANomCCU}`,

      dataSol: `${DateUtils.formataDataG5(new Date())}`,
      statusSolicitacao: 'Em andamento',
    };
  }
  async enviarFormulario(): Promise<WfFormData | undefined> {
    try {
      if (!this.formulariosValidos()) {
        this.wfService.abortSubmit();
        return;
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
}