import { ComponenteLoadingService } from '../../services/utils/componente-loading.service';
import { Component, ViewChild } from '@angular/core';
import {
  EtapaControlService,
  EtapaWorkflow,
} from '@services/utils/etapa-control.service';
import { WfFormData } from 'src/app/core/service/workflow/workflow-cockpit/dist/workflow-cockpit';
import { WorkflowService } from 'src/app/core/service/workflow/workflow.service';
import { DadosGestorComponent } from '@components/dados-gestor/dados-gestor.component';
import { DadosSolicitanteComponent } from '@components/dados-solicitante/dados-solicitante.component';
import { SeniorXTService } from '@services/requests/seniorXT.service';
import { EtapaModel } from 'src/app/modules/etapa.model';
import { VariaveisProcessoG7DTO } from '../../shared/models/variaveis-processo.model';
import { NotificationService } from '@services/utils/notification.service';
import { DadosColaboradorDTO } from 'src/app/shared/models/colaboradores.model';
import { InvokeService } from '../../services/requests/invoke/invoke.service';
import { catchError, EMPTY, finalize, take } from 'rxjs';
import { DadosSolicitanteDTO } from '../../shared/models/colaboradores.model';
import { DateUtils } from 'src/app/utils/date-utils';
import { DadosSolicitacaoComponent } from '@components/dados-solicitacao/dados-solicitacao.component';
import { DependentesResult } from 'src/app/shared/models/dependente.model';
import { ActivatedRoute } from '@angular/router';
import { resolveStepRouteData } from '@template/helpers/step-resolver';

@Component({
  selector: 'app-solicitacao',
  templateUrl: './solicitacao.component.html',
  styleUrl: './solicitacao.component.scss',
})
export class SolicitacaoComponent implements EtapaModel {
  @ViewChild(DadosSolicitanteComponent, { static: true })
  dadosSolicitanteComponent!: DadosSolicitanteComponent;

  @ViewChild(DadosSolicitacaoComponent, { static: true })
  dadosSolicitacaoComponent!: DadosSolicitacaoComponent;

  @ViewChild(DadosGestorComponent, { static: true })
  dadosGestorComponent!: DadosGestorComponent;

  nomeSolicitante!: string;

  constructor(
    private wfService: WorkflowService,
    private componenteLoadingService: ComponenteLoadingService,
    private etapaControlService: EtapaControlService,
    private seniorXT: SeniorXTService,
    private invoke: InvokeService,
    private notification: NotificationService,
    private route: ActivatedRoute,
  ) {
    const routeData = resolveStepRouteData(this.route);
    this.etapaControlService.setEtapaAtual(routeData.stepId as EtapaWorkflow);
    this.wfService.onSubmit(this.enviarFormulario.bind(this));
    this.nomeSolicitante = this.wfService.getUser().username;
  }

  ngOnInit(): void {
    this.componenteLoadingService.iniciarLoadingDinamico();
  }

  ngAfterViewInit(): void {
    this.inicializarFormulario();
  }

  inicializarFormulario() {
    this.seniorXT
      .dadosSolicitante(this.nomeSolicitante)
      .pipe(
        take(1),
        catchError((err) => {
          this.notification.requestError(err);
          return EMPTY;
        }),
        finalize(() => {
          this.componenteLoadingService.finalizarLoadingDinamico();
        }),
      )
      .subscribe((response) => {
        this.dadosSolicitanteComponent.inicializarComponente(response);

        this.buscaUsuarioNoPapelGestor().then(() => {
          if (this.ehGestor()) {
            this.dadosGestorComponent.inicializarComponente(
              response,
            );
            this.dadosSolicitacaoComponent.desabilitarCampos();
            this.dadosSolicitacaoComponent.preencherTabelaDependentes(undefined);
            return;
          }

          this.dadosSolicitacaoComponent.habilitarCampos();
          this.carregarDependentes(response);
        });
      });

    this.seniorXT
      .planosDeSaude()
      .pipe(take(1))
      .subscribe((response) => {
        this.dadosSolicitacaoComponent.inicializarComponente(response.LPlanos);
      });
    this.dadosSolicitacaoComponent.observacaoComponent.limparValidadores();
  }

  novoColaborador(dados: DadosColaboradorDTO) {
    if (!dados) {
      return;
    }

    this.dadosSolicitacaoComponent.habilitarCampos();
    this.carregarDependentes(dados);
  }

  private carregarDependentes(colaborador: DadosColaboradorDTO): void {
    this.dadosSolicitacaoComponent.dadosDependentesComponent.carregando = true;

    this.seniorXT
      .dadosDependentes(
        colaborador.NNumEmp,
        colaborador.NTipCol,
        colaborador.NNumCad,
      )
      .pipe(
        take(1),
        catchError((err) => {
          this.notification.requestError(err);
          return EMPTY;
        }),
        finalize(() => {
          this.dadosSolicitacaoComponent.dadosDependentesComponent.carregando = false;
        }),
      )
      .subscribe((retorno: DependentesResult) => {
        this.dadosSolicitacaoComponent.preencherTabelaDependentes({
          dependentes: retorno.dependentes,
          planos: retorno.codigoPlano,
          colaboradorSemPlano: retorno.colaboradorSemPlano,
        });
      });
  }

  ehGestor(): boolean {
    return this.dadosSolicitanteComponent?.ehGestor();
  }

  // Busca de papel Gestor pela G7
  async buscaUsuarioNoPapelGestor() {
    try {
      const estaNoPapel = await this.invoke.verificaUsuarioNoPapelPlataforma(
        this.nomeSolicitante,
        ['HCM Gestor Padrão'],
      );
      if (estaNoPapel) {
        this.dadosSolicitanteComponent.switchGestor(true);
      }
    } catch (error) {
      console.error(error);
      this.notification.requestError(
        'Erro ao validar usuário no papel da plataforma.',
      );
    }
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
    var colaborador: DadosColaboradorDTO = this.ehGestor()
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
      planosDisponiveis: (this.dadosSolicitacaoComponent.configPlanos.options || []).map(
        (plano) => ({
          codigoPlano: plano.value,
          descricao: plano.label,
        }),
      ),
      dependentesSelecionados: dadosSolicitacao.dependentesSelecionados,
      dependentesDisponiveis: dadosSolicitacao.dependentesFiltrados,
      dependentes: this.dadosSolicitacaoComponent.dependentesOriginais,
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