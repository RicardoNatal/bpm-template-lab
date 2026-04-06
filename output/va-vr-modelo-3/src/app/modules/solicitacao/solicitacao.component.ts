import { DadosSolicitacaoComponent } from './../../shared/components/dados-solicitacao/dados-solicitacao.component';
import { BeneficioAtualComponent } from './../../shared/components/beneficio-atual/beneficio-atual.component';
import { ComponenteLoadingService } from '../../services/utils/componente-loading.service';
import { Component, ViewChild } from '@angular/core';
import {
  EtapaControlService,
} from '@services/utils/etapa-control.service';
import { WfFormData } from 'src/app/core/service/workflow/workflow-cockpit/dist/workflow-cockpit';
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
import { catchError, EMPTY, finalize, firstValueFrom, take } from 'rxjs';
import { DateUtils } from 'src/app/utils/date-utils';
import { DadosValeModel } from 'src/app/shared/models/vale.model';
import { DadosSolicitacaoModel } from 'src/app/shared/models/solicitacao.model';
import { ActivatedRoute } from '@angular/router';
import { ObservacaoComponent } from '@components/observacao/observacao.component';
import { resolveStepRouteData } from '@template/helpers/step-resolver';

@Component({
  selector: 'app-solicitacao',
  templateUrl: './solicitacao.component.html',
  styleUrl: './solicitacao.component.scss',
})
export class SolicitacaoComponent implements EtapaModel {
  @ViewChild(DadosSolicitanteComponent, { static: true })
  dadosSolicitanteComponent!: DadosSolicitanteComponent;

  @ViewChild(BeneficioAtualComponent, { static: true })
  beneficioAtualComponent!: BeneficioAtualComponent;

  @ViewChild(DadosSolicitacaoComponent, { static: true })
  dadosSolicitacaoComponent!: DadosSolicitacaoComponent;

  @ViewChild(ObservacaoComponent, { static: true })
  observacaoRhComponent!: ObservacaoComponent;

  nomeSolicitante!: string;
  isRevisao: boolean;
  valesPorEmpresa: DadosValeModel[] = [];

  constructor(
    private wfService: WorkflowService,
    private componenteLoadingService: ComponenteLoadingService,
    private etapaControlService: EtapaControlService,
    private seniorXT: SeniorXTService,
    private route: ActivatedRoute,
    private invoke: InvokeService,
    private notification: NotificationService,
  ) {
    // Step resolution via route data — derivado de config (WORKFLOW_ROUTES.routeData).
    // Elimina dependência de router.url.startsWith('/revisao').
    const routeData = resolveStepRouteData(this.route);
    this.isRevisao = routeData.mode === 'review';
    this.etapaControlService.setEtapaAtual(routeData.stepId);
    this.wfService.onSubmit(this.enviarFormulario.bind(this));
    this.nomeSolicitante = this.wfService.getUser().username;
  }

  ngOnInit(): void {
    this.componenteLoadingService.iniciarLoadingDinamico();
  }

  ngAfterViewInit(): void {
    this.inicializarFormulario();
  }

  async inicializarFormulario() {
    if (this.isRevisao) {
      this.wfService
        .requestProcessVariables()
        .then((retornoVariaveis) => {
          this.preencherFormulario(retornoVariaveis as VariaveisProcessoDTO);
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
    } else {
      await this.buscarDadosSolicitante();
      await this.buscarBeneficioAtual();
    }
    this.dadosSolicitacaoComponent.observacaoComponent.limparValidadores();
  }

  desabilitarFormulario() {
    this.beneficioAtualComponent.desabilitarCampos();
    this.dadosSolicitacaoComponent.desabilitarCampos();
    this.dadosSolicitanteComponent.desabilitarCampos();
  }

  preencherFormulario(variaveis: VariaveisProcessoDTO) {
    this.valesPorEmpresa = variaveis.valesPorEmpresa;
    this.dadosSolicitacaoComponent.preencherFormulario(
      variaveis.dadosSolicitacao,
    );
    this.dadosSolicitanteComponent.preencherFormulario(
      variaveis.dadosSolicitante,
    );
    this.beneficioAtualComponent.preencherFormulario(variaveis.beneficioAtual);
    this.observacaoRhComponent.preencherFormulario(variaveis.observacaoRh);
    this.observacaoRhComponent.desabilitarCampos();
  }

  async buscarDadosSolicitante(): Promise<void> {
    const response = await firstValueFrom(
      this.seniorXT.dadosSolicitante(this.nomeSolicitante).pipe(
        catchError((err) => {
          this.notification.requestError(err);
          this.desabilitarFormulario();
          this.componenteLoadingService.finalizarLoadingDinamico();
          return EMPTY;
        }),
      ),
    );

    if (response) {
      this.dadosSolicitanteComponent.inicializarComponente(response);
    }
  }

  async buscarBeneficioAtual(): Promise<void> {
    const response = await firstValueFrom(
      this.seniorXT.beneficioAtual().pipe(
        take(1),
        catchError((err) => {
          this.notification.requestError(err);
          this.desabilitarFormulario();
          this.componenteLoadingService.finalizarLoadingDinamico();
          return EMPTY;
        }),
      ),
    );

    if (!response) {
      this.notification.requestError('Colaborador não possui beneficio atual');
      this.desabilitarFormulario();
      this.componenteLoadingService.finalizarLoadingDinamico();
      return;
    }

    this.beneficioAtualComponent.inicializarComponente(response);
    this.buscarValesPorEmpresa();
  }

  buscarValesPorEmpresa() {
    const codsValesAtuais = this.beneficioAtualComponent.beneficioAtual.map(
      (vale) => vale.NCodVal,
    );

    this.seniorXT
      .valesPorEmpresa()
      .pipe(
        take(1),
        catchError((err) => {
          this.notification.requestError(err);
          this.desabilitarFormulario();
          this.componenteLoadingService.finalizarLoadingDinamico();
          return EMPTY;
        }),
        finalize(() => {
          this.componenteLoadingService.finalizarLoadingDinamico();
        }),
      )
      .subscribe((response) => {
        this.valesPorEmpresa = response;

        if (this.valesPorEmpresa.length !== 2) {
          this.notification.requestError(
            'Foi identificada uma inconsistência na configuração de VA/VR para a empresa do colaborador. Entre em contato com o Administrador do sistema para realizar o ajuste necessário.',
          );
          this.desabilitarFormulario();
          return;
        }

        const valesFiltrados = response.filter(
          (vale) => !codsValesAtuais.includes(vale.NCodVal),
        );

        if (valesFiltrados.length !== 1) {
          this.notification.requestError(
            'O benefício atualmente atribuído ao colaborador não está de acordo com a configuração de VA/VR da empresa do colaborador. Entre em contato com o Administrador do sistema para realizar o ajuste necessário.',
          );
          this.desabilitarFormulario();
          return;
        }

        this.dadosSolicitacaoComponent.definirOpcoesDeVale(valesFiltrados);
      });
  }

  novoColaborador(dados: DadosColaboradorDTO) {
    console.log(dados);
  }

  validarFormularios(): boolean {
    const solicitanteValido =
      this.dadosSolicitanteComponent.validarFormulario();
    const dadosSolicitacaoValido =
      this.dadosSolicitacaoComponent.validarFormulario();

    return solicitanteValido && dadosSolicitacaoValido;
  }

  montaFormData(): VariaveisProcessoG7DTO {
    const solicitante: DadosSolicitante =
      this.dadosSolicitanteComponent.retornaValores();
    const beneficioAtual: DadosValeModel[] =
      this.beneficioAtualComponent.retornaValores();
    const dadosSolicitacao: DadosSolicitacaoModel =
      this.dadosSolicitacaoComponent.retornaValores();

    const valesAtuais = this.montaListaValesAtuais();

    const codsValesAtuais = this.beneficioAtualComponent.beneficioAtual.map(
      (vale) => vale.NCodVal,
    );

    const valeSubstituido = this.valesPorEmpresa.filter((vale) =>
      codsValesAtuais.includes(vale.NCodVal),
    );

    return {
      nomeSolicitante: solicitante.ANomFun,
      matriculaSolicitante: solicitante.NNumCad.toString(),
      dadosSolicitante: JSON.stringify(solicitante),
      beneficioAtual: JSON.stringify(beneficioAtual),
      dadosSolicitacao: JSON.stringify(dadosSolicitacao),
      codNomeValeNovo: `${dadosSolicitacao.beneficioSelecionado[0].NCodVal} - ${dadosSolicitacao.beneficioSelecionado[0].ADesVal}`,
      codValeAtual: `${valeSubstituido[0].NCodVal}`,
      nomValeAtual: `${valeSubstituido[0].ADesVal}`,
      codNomeValesAtuais: valesAtuais,
      codNovoVale: `${dadosSolicitacao.beneficioSelecionado[0].NCodVal}`,
      nomNovoVale: dadosSolicitacao.beneficioSelecionado[0].ADesVal,
      observacaoSolicitante: dadosSolicitacao.observacaoSolicitante,
      valesPorEmpresa: JSON.stringify(this.valesPorEmpresa),

      nomeMatriculaSol: `${solicitante.NNumCad} - ${solicitante.ANomFun}`,
      codNomeEmpresaSol: `${solicitante.NNumEmp} - ${solicitante.ANomEmp}`,
      codNomeFilialSol: `${solicitante.NCodFil} - ${solicitante.ANomFil}`,
      centroCustoSol: `${solicitante.ANomCcu}`,

      dataSol: `${DateUtils.formataDataG5(new Date())}`,
      statusSolicitacao: 'Em andamento',
    };
  }

  montaListaValesAtuais(): string {
    const valesAtuais: DadosValeModel[] =
      this.beneficioAtualComponent.beneficioAtual;
    let codNomeValesAtuais = '';
    for (const vale of valesAtuais) {
      codNomeValesAtuais += `${vale.NCodVal} - ${vale.ADesVal}\n`;
    }
    return codNomeValesAtuais;
  }

  async enviarFormulario(): Promise<WfFormData | undefined> {
    try {
      if (this.componenteLoadingService.estaCarregando) {
        this.wfService.abortSubmit();
      }
      if (!this.validarFormularios()) {
        this.wfService.abortSubmit();
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
}
