import { Component, Input } from '@angular/core';
import { ComponentModel } from '@components/component.model';
import { DependenteConfig } from '../../models/dependente.model';
import { TipoOperacao } from '../../models/tipoOperacao.model';

@Component({
  selector: 'app-dados-dependentes',
  templateUrl: './dados-dependentes.component.html',
  styleUrl: './dados-dependentes.component.scss',
})
export class DadosDependentesComponent implements ComponentModel {
  @Input() tipoOperacao!: TipoOperacao;

  dependentesFiltrados: DependenteConfig[] = [];
  dependentesSelecionados: DependenteConfig[] = [];
  interacaoBloqueada: boolean = false;
  bloqueioSelecao: boolean = false;
  columnConfig = [
    { field: 'nome', header: 'Nome', size: '50%' },
    { field: 'parentesco', header: 'Parentesco', size: '20%' },
    { field: 'data_nascimento', header: 'Data de Nascimento', size: '30%' },
  ];
  carregando: boolean = false;
  totalDependentes: number = 0;

  inicializarComponente(dependentes: DependenteConfig[] = []): void {
    this.prepararDependentes(dependentes);
  }

  preencherFormulario(dependentes: DependenteConfig[] = []): void {
    this.prepararDependentes(dependentes);
  }

  prepararDependentes(dependentes: DependenteConfig[] = []): {
    dependentesFiltrados: DependenteConfig[];
    totalRegistros: number;
  } {
    const listaDependentes = Array.isArray(dependentes) ? [...dependentes] : [];

    this.dependentesFiltrados = listaDependentes;
    this.totalDependentes = listaDependentes.length;

    return {
      dependentesFiltrados: this.dependentesFiltrados,
      totalRegistros: this.totalDependentes,
    };
  }

  retornaValores() {
    return {
      dependentesFiltrados: this.dependentesFiltrados,
      totalRegistros: this.totalDependentes,
      dependentesSelecionados: this.dependentesSelecionados,
    };
  }

  formularioValido(): boolean {
    return true;
  }

  limparValidadores(): void {
    return;
  }

  setarValidadores(): void {
    return;
  }

  desabilitarCampos(): void {
    this.interacaoBloqueada = true;
  }

  habilitarCampos(): void {
    this.interacaoBloqueada = false;
  }

  bloquearSelecaoDependentes(bloquear: boolean): void {
    this.bloqueioSelecao = bloquear;

    if (bloquear) {
      this.dependentesSelecionados = [];
    }
  }

  onSelecionadosChange(event: any) {
    const values = Array.isArray(event?.values) ? event.values : [];

    this.dependentesSelecionados = [...values];

    if (this.tipoOperacao !== TipoOperacao.Excluir) {
      return;
    }

    const titularSelecionado = values.some(
      (item: DependenteConfig) =>
        item?.nome === this.dependentesFiltrados[0]?.nome,
    );

    if (titularSelecionado) {
      this.dependentesSelecionados = [...this.dependentesFiltrados];
    }
  }
}
