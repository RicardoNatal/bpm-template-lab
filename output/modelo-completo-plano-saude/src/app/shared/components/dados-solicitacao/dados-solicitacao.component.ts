import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ComponentModel } from '@components/component.model';
import { DadosDependentesComponent } from '@components/dados-dependentes/dados-dependentes.component';
import { ObservacaoComponent } from '@components/observacao/observacao.component';
import { SelectComponent } from '@components/select/select.component';
import { SelectConfig } from '@components/select/select.model';
import { NotificationService } from '@services/utils/notification.service';
import { requiredObjectValidator } from 'src/app/utils/validators.utils';
import { DependenteConfig } from '../../models/dependente.model';
import { DadosPlano } from '../../models/plano.model';
import { DadosSolicitacao } from '../../models/solicitacao.model';
import { TipoOperacao } from '../../models/tipoOperacao.model';

@Component({
  selector: 'app-dados-solicitacao',
  templateUrl: './dados-solicitacao.component.html',
  styleUrl: './dados-solicitacao.component.scss',
})
export class DadosSolicitacaoComponent implements ComponentModel {
  @ViewChild(DadosDependentesComponent, { static: true })
  dadosDependentesComponent!: DadosDependentesComponent;

  @ViewChild(ObservacaoComponent, { static: true })
  observacaoComponent!: ObservacaoComponent;

  @ViewChild('tipoSolicitacao', { static: true })
  tipoSolicitacaoComponent!: SelectComponent;

  @ViewChild('plano', { static: true })
  planoComponent!: SelectComponent;

  configTipoSolicitacao: SelectConfig = {
    options: [
      {
        label: 'Solicitar',
        value: TipoOperacao.Solicitar,
        disabled: false,
        size: 2,
      },
      {
        label: 'Alterar',
        value: TipoOperacao.Alterar,
        disabled: false,
        size: 2,
      },
      {
        label: 'Excluir',
        value: TipoOperacao.Excluir,
        disabled: false,
        size: 2,
      },
    ],
    label: 'Selecione uma opção',
  };

  configPlanos: SelectConfig = {
    options: [],
    label: 'Selecione um plano',
  };

  formulario!: FormGroup;
  dependentes!: DependenteConfig[];
  dependentesOriginais: DependenteConfig[] = [];
  carregandoDependentes: boolean = false;
  totalDependentes: number = 0;
  colaboradorSemPlano: boolean = false;
  planoAtivo: number | null = null;
  private planosPorChave = new Map<string, DadosPlano>();

  constructor(
    private fb: FormBuilder,
    private notification: NotificationService,
  ) {
    this.formulario = this.fb.group({
      tipoSolicitacao: [
        { value: TipoOperacao.Solicitar, disabled: false },
        [Validators.required, requiredObjectValidator()],
      ],
      planos: [
        { value: null, disabled: false },
        [Validators.required, requiredObjectValidator()],
      ],
    });

    this.formulario.get('tipoSolicitacao')?.valueChanges.subscribe(() => {
      this.processarRegrasSolicitacao();
    });
  }

  inicializarComponente(dados: DadosPlano[]): void {
    this.planosPorChave.clear();
    this.configPlanos.options = [];

    for (let plano of dados) {
      const chavePlano = this.gerarChavePlano(plano.NCodOem, plano.NCodPla);
      this.planosPorChave.set(chavePlano, plano);
      this.configPlanos.options.push({
        label: plano.ANomPla,
        value: chavePlano,
        disabled: false,
        size: 2,
      });
    }
  }

  preencherTabelaDependentes(valoresFormulario?: {
    tipoSolicitacao?: TipoOperacao | null;
    planos?: any;
    dependentes?: DependenteConfig[];
    colaboradorSemPlano?: boolean;
  }): void {
    if (valoresFormulario) {
      const patch: Record<string, unknown> = {};

      if (
        Object.prototype.hasOwnProperty.call(
          valoresFormulario,
          'tipoSolicitacao',
        )
      ) {
        patch.tipoSolicitacao = valoresFormulario.tipoSolicitacao ?? null;
      }

      if (Object.prototype.hasOwnProperty.call(valoresFormulario, 'planos')) {
        patch.planos = this.valorPlanoParaControle(valoresFormulario.planos);
      }

      if (Object.keys(patch).length > 0) {
        this.formulario.patchValue(patch);
      }
    }

    if (valoresFormulario?.dependentes) {
      this.dependentesOriginais = [...valoresFormulario.dependentes];
      this.atualizarPlanoAtivoPorDependentes(this.dependentesOriginais);
      this.aplicarPlanoTitularAutomaticamente();
    }

    if (typeof valoresFormulario?.colaboradorSemPlano === 'boolean') {
      this.colaboradorSemPlano = valoresFormulario.colaboradorSemPlano;
    }

    this.aplicarRegraTipoSolicitacaoSemPlano(
      valoresFormulario?.colaboradorSemPlano === true,
    );

    this.processarRegrasSolicitacao();
  }

  preencherFormulario(dadosSolicitacao: DadosSolicitacao): void {
    if (!dadosSolicitacao) {
      return;
    }

    const dados = dadosSolicitacao as DadosSolicitacao & {
      operacaoEscolhida?: TipoOperacao | number | null;
      planoSelecionado?: {
        codigoPlano?: number | null;
        codOem?: number | null;
      } | null;
      dependentesDisponiveis?: any[];
      dependentesSelecionados?: any[];
    };

    const toNumberOrNull = (valor: unknown): number | null => {
      if (valor === null || valor === undefined || valor === '') {
        return null;
      }

      const numero = Number(valor);
      return Number.isNaN(numero) ? null : numero;
    };

    const mapearDependente = (dependente: any): DependenteConfig => {
      return {
        codigo_dependente:
          toNumberOrNull(dependente?.codigo_dependente ?? dependente?.id) ?? 0,
        nome: dependente?.nome ?? '',
        parentesco: dependente?.parentesco ?? '',
        data_nascimento: dependente?.data_nascimento ?? '',
        codigo_plano: toNumberOrNull(dependente?.codigo_plano),
      };
    };

    const tipoSolicitacao =
      toNumberOrNull(dados?.operacao?.id) ??
      toNumberOrNull(dados?.operacaoEscolhida);

    const codigoPlanoSelecionado =
      toNumberOrNull(dados?.plano?.id) ??
      toNumberOrNull(dados?.planoSelecionado?.codigoPlano);

    this.formulario.patchValue(
      {
        tipoSolicitacao,
        planos: this.valorPlanoParaControle(codigoPlanoSelecionado),
      },
      { emitEvent: false },
    );

    if (
      codigoPlanoSelecionado !== null &&
      !this.existePlanoComCodigo(codigoPlanoSelecionado)
    ) {
      const codOemPlano = toNumberOrNull(dados?.planoSelecionado?.codOem) ?? 0;
      const chavePlano = this.gerarChavePlano(
        codOemPlano,
        codigoPlanoSelecionado,
      );
      this.planosPorChave.set(chavePlano, {
        NCodPla: codigoPlanoSelecionado,
        ANomPla: dados?.plano?.descricao || `Plano ${codigoPlanoSelecionado}`,
        NCodOem: codOemPlano,
      });

      this.configPlanos.options.push({
        label: dados?.plano?.descricao || `Plano ${codigoPlanoSelecionado}`,
        value: chavePlano,
        disabled: false,
        size: 2,
      });
    }

    const dependentesDisponiveis = Array.isArray(dados?.dependentesDisponiveis)
      ? dados.dependentesDisponiveis.map(mapearDependente)
      : [];

    const dependentesSelecionados = Array.isArray(
      dados?.dependentesSelecionados,
    )
      ? dados.dependentesSelecionados.map(mapearDependente)
      : [];

    const dependentesLegado = Array.isArray(dados?.dependentes)
      ? dados.dependentes.map(mapearDependente)
      : [];

    const baseDependentes =
      dependentesDisponiveis.length > 0
        ? dependentesDisponiveis
        : dependentesLegado;

    this.dependentesOriginais = [...baseDependentes];
    this.atualizarPlanoAtivoPorDependentes(this.dependentesOriginais);
    this.processarRegrasSolicitacao();

    const idsSelecionados = new Set(
      (dependentesSelecionados.length > 0
        ? dependentesSelecionados
        : dependentesLegado.filter((dependente: any) => dependente?.selecionado)
      ).map((dependente) => dependente.codigo_dependente),
    );

    this.dadosDependentesComponent.dependentesSelecionados =
      this.dadosDependentesComponent.dependentesFiltrados.filter((dependente) =>
        idsSelecionados.has(dependente.codigo_dependente),
      );

    this.totalDependentes = this.dadosDependentesComponent.totalDependentes;
    this.observacaoComponent.preencherFormulario(dados?.observacao || '');
    if (tipoSolicitacao !== TipoOperacao.Alterar) {
      this.planoComponent?.setDisabledState(true);
    }
  }

  private processarRegrasSolicitacao(): void {
    this.aplicarFiltroDependentes();
    this.aplicarRegraPlanoNaExclusao();
  }

  private atualizarPlanoAtivoPorDependentes(
    dependentes: DependenteConfig[],
  ): void {
    const titularComPlano = dependentes.find((dependente) => {
      return (
        this.ehTitular(dependente) &&
        dependente.codigo_plano !== null &&
        dependente.codigo_plano !== undefined
      );
    });

    if (titularComPlano) {
      this.planoAtivo = titularComPlano.codigo_plano ?? null;
      return;
    }

    const primeiroComPlano = dependentes.find((dependente) => {
      return (
        dependente.codigo_plano !== null &&
        dependente.codigo_plano !== undefined
      );
    });

    this.planoAtivo = primeiroComPlano?.codigo_plano ?? null;
  }

  private aplicarPlanoTitularAutomaticamente(): void {
    if (this.planoAtivo === null || this.planoAtivo === undefined) {
      return;
    }

    const planosControl = this.formulario.get('planos');
    if (!planosControl) {
      return;
    }

    planosControl.setValue(this.valorPlanoParaControle(this.planoAtivo), {
      emitEvent: false,
    });
  }

  private ehTitular(dependente: DependenteConfig): boolean {
    const nome = dependente.nome?.trim().toUpperCase();
    const parentesco = dependente.parentesco?.trim().toUpperCase();
    return nome === 'TITULAR' || parentesco === 'TITULAR';
  }

  private aplicarFiltroDependentes(): void {
    const tipoSolicitacaoSelecionada = this.formulario.get('tipoSolicitacao')
      ?.value as TipoOperacao | null;
    const colaboradorTemPlano = !this.colaboradorSemPlano;
    const alteracaoPlano = tipoSolicitacaoSelecionada === TipoOperacao.Alterar;
    const exclusaoPlano = tipoSolicitacaoSelecionada === TipoOperacao.Excluir;

    const dependentesFiltrados =
      colaboradorTemPlano &&
      tipoSolicitacaoSelecionada === TipoOperacao.Solicitar
        ? this.dependentesOriginais.filter((dependente) => {
            return !dependente.codigo_plano;
          })
        : alteracaoPlano
          ? this.dependentesOriginais.filter((dependente) => {
              return !!dependente.codigo_plano;
            })
          : exclusaoPlano
            ? this.dependentesOriginais.filter((dependente) => {
                return !!dependente.codigo_plano;
              })
            : this.dependentesOriginais;

    this.dadosDependentesComponent.bloquearSelecaoDependentes(alteracaoPlano);

    const retornoDependentes =
      this.dadosDependentesComponent.prepararDependentes(dependentesFiltrados);
    this.totalDependentes = retornoDependentes.totalRegistros;
  }

  private aplicarRegraTipoSolicitacaoSemPlano(
    colaboradorSemPlano: boolean,
  ): void {
    this.configTipoSolicitacao.options = this.configTipoSolicitacao.options.map(
      (opcao) => {
        if (!colaboradorSemPlano) {
          return { ...opcao, disabled: false };
        }

        if (opcao.value === TipoOperacao.Solicitar) {
          return { ...opcao, disabled: false };
        }

        return { ...opcao, disabled: true };
      },
    );

    if (colaboradorSemPlano) {
      this.formulario.patchValue(
        { tipoSolicitacao: TipoOperacao.Solicitar },
        { emitEvent: false },
      );
    }
  }

  private aplicarRegraPlanoNaExclusao(): void {
    const planosControl = this.formulario.get('planos');

    if (!planosControl) {
      return;
    }

    if (this.formulario.disabled) {
      return;
    }

    const tipoSolicitacaoSelecionada = this.formulario.get('tipoSolicitacao')
      ?.value as TipoOperacao | null;

    this.atualizarPlanoAtivoPorDependentes(this.dependentesOriginais);

    const possuiPlanoAtivo =
      this.planoAtivo !== null &&
      this.planoAtivo !== undefined &&
      this.planoAtivo !== 0;

    const deveFixarPlano =
      tipoSolicitacaoSelecionada === TipoOperacao.Excluir ||
      (tipoSolicitacaoSelecionada === TipoOperacao.Solicitar &&
        possuiPlanoAtivo);

    // Garante estado base antes de qualquer regra específica.
    planosControl.enable({ emitEvent: false });

    if (
      tipoSolicitacaoSelecionada === TipoOperacao.Solicitar &&
      !possuiPlanoAtivo
    ) {
      planosControl.setValue(null, { emitEvent: false });
      return;
    }

    if (deveFixarPlano) {
      if (possuiPlanoAtivo) {
        planosControl.setValue(this.valorPlanoParaControle(this.planoAtivo), {
          emitEvent: false,
        });
      }
      planosControl.disable({ emitEvent: false });
      return;
    }
  }

  retornaValores() {
    const valorPlanoSelecionado = this.formulario.getRawValue()?.planos;
    const planoSelecionado = this.obterPlanoPorValorControle(
      valorPlanoSelecionado,
    );

    const codigoPlanoSelecionado = planoSelecionado
      ? planoSelecionado.NCodPla
      : valorPlanoSelecionado !== null &&
          valorPlanoSelecionado !== undefined &&
          valorPlanoSelecionado !== ''
        ? Number(valorPlanoSelecionado)
        : null;

    return {
      ...this.formulario.getRawValue(),
      planos: Number.isNaN(codigoPlanoSelecionado)
        ? null
        : codigoPlanoSelecionado,
      codOemPlanoSelecionado: planoSelecionado?.NCodOem ?? null,
      ...this.dadosDependentesComponent.retornaValores(),
    };
  }

  formularioValido(): boolean {
    const observacaoValida = this.observacaoComponent.formularioValido();

    for (const campo in this.formulario.controls) {
      this.formulario.get(campo)?.markAsTouched();
      this.formulario.get(campo)?.markAsDirty();
      this.formulario.get(campo)?.updateValueAndValidity();
    }

    if (this.formulario.invalid && this.formulario.enabled) {
      this.notification.formError(
        'Favor preencher os dados da solicitação antes de continuar.',
      );
      return false;
    }

    if (!observacaoValida) {
      return false;
    }

    if (!this.validarConsistenciasPorOperacao()) {
      return false;
    }

    return true;
  }

  private validarConsistenciasPorOperacao(): boolean {
    const tipoSolicitacao = this.formulario.get('tipoSolicitacao')
      ?.value as TipoOperacao | null;
    const planoSelecionado = this.obterCodigoPlanoSelecionado();
    const dependentesSelecionados =
      this.dadosDependentesComponent.dependentesSelecionados || [];
    const possuiDependentesDisponiveis =
      (this.dadosDependentesComponent.dependentesFiltrados || []).length > 0;

    if (!tipoSolicitacao) {
      this.notification.formError('Selecione o tipo de solicitação.');
      return false;
    }

    if (tipoSolicitacao === TipoOperacao.Solicitar) {
      if (!possuiDependentesDisponiveis) {
        this.notification.formError(
          'Nao ha dependentes disponiveis para incluir nesta solicitacao.',
        );
        return false;
      }

      if (!dependentesSelecionados.length) {
        this.notification.formError(
          'Selecione ao menos um dependente para solicitar inclusao no plano.',
        );
        return false;
      }
    }

    if (tipoSolicitacao === TipoOperacao.Alterar) {
      const planoAtual = this.planoAtivo;

      if (
        planoAtual !== null &&
        planoAtual !== undefined &&
        planoSelecionado === planoAtual
      ) {
        this.notification.formError(
          'Para alterar, selecione um plano diferente do plano atual.',
        );
        return false;
      }

      if (!possuiDependentesDisponiveis) {
        this.notification.formError(
          'Nao ha dependentes com plano ativo para realizar alteracao.',
        );
        return false;
      }
    }

    if (tipoSolicitacao === TipoOperacao.Excluir) {
      if (!possuiDependentesDisponiveis) {
        this.notification.formError(
          'Nao ha dependentes com plano ativo para exclusao.',
        );
        return false;
      }

      if (!dependentesSelecionados.length) {
        this.notification.formError(
          'Selecione ao menos um dependente para excluir do plano.',
        );
        return false;
      }
    }

    return true;
  }

  limparValidadores(): void {
    for (const campo in this.formulario.controls) {
      this.formulario.get(campo)?.clearValidators();
      this.formulario.get(campo)?.updateValueAndValidity();
    }
  }

  setarValidadores(): void {
    this.formulario
      .get('tipoSolicitacao')
      ?.setValidators([Validators.required, requiredObjectValidator()]);
    this.formulario
      .get('planos')
      ?.setValidators([Validators.required, requiredObjectValidator()]);

    for (const campo in this.formulario.controls) {
      this.formulario.get(campo)?.updateValueAndValidity();
    }
  }

  desabilitarCampos(): void {
    this.formulario.disable();
    this.dadosDependentesComponent.desabilitarCampos();
    this.observacaoComponent.desabilitarCampos();
    this.planoComponent?.setDisabledState(true);
    this.tipoSolicitacaoComponent?.setDisabledState(true);
  }

  habilitarCampos(): void {
    this.formulario.enable();
    this.dadosDependentesComponent.habilitarCampos();
    this.observacaoComponent.habilitarCampos();
    this.planoComponent?.setDisabledState(false);
    this.tipoSolicitacaoComponent?.setDisabledState(false);
  }

  private gerarChavePlano(codOem: number, codPla: number): string {
    return `${codOem}-${codPla}`;
  }

  private valorPlanoParaControle(valor: unknown): string | null {
    if (valor === null || valor === undefined || valor === '') {
      return null;
    }

    if (typeof valor === 'string' && this.planosPorChave.has(valor)) {
      return valor;
    }

    const codigoPlano = Number(valor);
    if (Number.isNaN(codigoPlano)) {
      return null;
    }

    const entrada = Array.from(this.planosPorChave.entries()).find(
      ([, plano]) => plano.NCodPla === codigoPlano,
    );

    if (entrada) {
      return entrada[0];
    }

    return String(codigoPlano);
  }

  private existePlanoComCodigo(codigoPlano: number): boolean {
    return Array.from(this.planosPorChave.values()).some(
      (plano) => plano.NCodPla === codigoPlano,
    );
  }

  private obterPlanoPorValorControle(valor: unknown): DadosPlano | undefined {
    if (valor === null || valor === undefined || valor === '') {
      return undefined;
    }

    if (typeof valor === 'string') {
      const planoPorChave = this.planosPorChave.get(valor);
      if (planoPorChave) {
        return planoPorChave;
      }
    }

    const codigoPlano = Number(valor);
    if (Number.isNaN(codigoPlano)) {
      return undefined;
    }

    return Array.from(this.planosPorChave.values()).find(
      (plano) => plano.NCodPla === codigoPlano,
    );
  }

  private obterCodigoPlanoSelecionado(): number | null {
    const valorPlanoSelecionado = this.formulario.get('planos')?.value;
    const planoSelecionado = this.obterPlanoPorValorControle(
      valorPlanoSelecionado,
    );

    if (planoSelecionado) {
      return planoSelecionado.NCodPla;
    }

    if (
      valorPlanoSelecionado === null ||
      valorPlanoSelecionado === undefined ||
      valorPlanoSelecionado === ''
    ) {
      return null;
    }

    const codigoPlano = Number(valorPlanoSelecionado);
    return Number.isNaN(codigoPlano) ? null : codigoPlano;
  }
}
