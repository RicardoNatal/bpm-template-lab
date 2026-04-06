import { Component } from '@angular/core';
import { ColumnConfig } from '@senior-hcm-service-tower/hst-simple-table/lib/model/column';
import {
  ComponenteFormulario,
  ComponenteHabilitavel,
  ComponenteInicializavel,
} from '@components/component.model';
import { DadosValeModel } from '../../models/vale.model';

@Component({
  selector: 'app-beneficio-atual',
  templateUrl: './beneficio-atual.component.html',
  styleUrl: './beneficio-atual.component.scss',
})
// Componente de exibição: não possui formulário nem validação.
// Implementa apenas as capacidades que fazem sentido para um componente read-display.
export class BeneficioAtualComponent
  implements
    ComponenteFormulario<DadosValeModel[], DadosValeModel[]>,
    ComponenteInicializavel<DadosValeModel[]>,
    ComponenteHabilitavel
{
  configuracaoDasColunas: ColumnConfig[] = [];
  beneficioAtual: DadosValeModel[] = [];
  isDisable: boolean = false;

  inicializarComponente(beneficios: DadosValeModel[]): void {
    this.configuracaoDasColunas = this.montaConfiguracaoDasColunas();
    this.beneficioAtual = beneficios;
  }

  preencherFormulario(beneficioAtual: DadosValeModel[]): void {
    if (!beneficioAtual) return;
    this.inicializarComponente(beneficioAtual);
  }

  retornaValores(): DadosValeModel[] {
    return this.beneficioAtual;
  }

  desabilitarCampos(): void {
    this.isDisable = true;
  }

  habilitarCampos(): void {
    this.isDisable = false;
  }

  montaConfiguracaoDasColunas(): ColumnConfig[] {
    return [
      {
        field: 'NCodVal',
        header: 'Código Vale',
        size: '50%',
      },
      {
        field: 'ADesVal',
        header: 'Descrição',
        size: '50%',
      },
    ];
  }
}

