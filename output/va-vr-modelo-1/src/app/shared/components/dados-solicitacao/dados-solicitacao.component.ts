import { Component, ViewChild } from '@angular/core';
import { ComponentModel } from '@components/component.model';
import { ObservacaoComponent } from '@components/observacao/observacao.component';
import { SelectComponent } from '@components/select/select.component';
import { SelectConfig } from '@components/select/select.model';
import { TermoAdesaoComponent } from '@components/termo-adesao/termo-adesao.component';
import { DadosSolicitacaoModel } from '../../models/solicitacao.model';
import { DadosValeModel } from '../../models/vale.model';

@Component({
  selector: 'app-dados-solicitacao',
  templateUrl: './dados-solicitacao.component.html',
  styleUrl: './dados-solicitacao.component.scss',
})
export class DadosSolicitacaoComponent implements ComponentModel {
  @ViewChild(TermoAdesaoComponent, { static: true })
  termoAdesaoComponent!: TermoAdesaoComponent;

  @ViewChild(ObservacaoComponent, { static: true })
  observacaoComponent!: ObservacaoComponent;

  @ViewChild(SelectComponent, { static: false })
  selectComponent!: SelectComponent;

  valesPorEmpresa: {
    label: string;
    value: any;
    disabled?: boolean | undefined;
  }[] = [];

  selectConfig: SelectConfig = {
    label: 'Alterar benefício VA/VR para',
    placeholder: 'Selecione uma opção',
    options: this.valesPorEmpresa,
  };

  inicializarComponente(...args: any[]): void {
    this.termoAdesaoComponent.inicializarComponente();
    this.observacaoComponent.inicializarComponente();
  }

  definirOpcoesDeVale(vales: DadosValeModel[]): void {
    this.valesPorEmpresa = vales.map((vale) => ({
      label: `${vale.NCodVal} - ${vale.ADesVal}`,
      value: vale.NCodVal,
    }));

    this.selectConfig = {
      ...this.selectConfig,
      options: this.valesPorEmpresa,
    };
  }

  definirValeSelecionado(vales: DadosValeModel[]) {
    this.definirOpcoesDeVale(vales);
    this.selectComponent.value = vales[0].NCodVal;
  }

  preencherFormulario(dadosSolicitacao: DadosSolicitacaoModel): void {
    if (!dadosSolicitacao) return;
    if (dadosSolicitacao.observacaoSolicitante) {
      this.observacaoComponent.preencherFormulario(
        dadosSolicitacao.observacaoSolicitante,
      );
    }
    this.termoAdesaoComponent.preencherFormulario(dadosSolicitacao.termo);
    this.definirValeSelecionado(dadosSolicitacao.beneficioSelecionado);
  }

  retornaValores(): DadosSolicitacaoModel {
    const opcaoSelecionada = this.selectComponent?.config?.options?.find(
      (opt) => opt.value === this.selectComponent?.value,
    );

    const nomeVale =
      opcaoSelecionada?.label?.split(' - ').slice(1).join(' - ') ?? 'N/A';

    return {
      beneficioSelecionado: [
        {
          NCodVal: this.selectComponent?.value,
          NTabEve: 1,
          ADesVal: nomeVale,
        },
      ],
      termo: this.termoAdesaoComponent.retornaValores(),
      observacaoSolicitante: this.observacaoComponent.retornaValores(),
    };
  }

  validarFormulario(): boolean {
    const termoValido = this.termoAdesaoComponent.validarFormulario();
    const observacaoValida = this.observacaoComponent.validarFormulario();
    const selectValido = this.selectComponent.validarFormulario();

    return termoValido && observacaoValida && selectValido;
  }

  limparValidadores(): void {
    this.termoAdesaoComponent.limparValidadores();
    this.observacaoComponent.limparValidadores();
  }

  setarValidadores(): void {
    this.termoAdesaoComponent.setarValidadores();
    this.observacaoComponent.setarValidadores();
  }

  desabilitarCampos(): void {
    this.termoAdesaoComponent.desabilitarCampos();
    this.observacaoComponent.desabilitarCampos();
    this.selectComponent.isDisabled = true;
  }

  habilitarCampos(): void {
    this.termoAdesaoComponent.habilitarCampos();
    this.observacaoComponent.habilitarCampos();
  }
}
