import { DadosSolicitante } from './colaboradores.model';
import { DadosPlano } from './plano.model';

export type Id = string | number;

export interface OperacaoSelecionada {
  id: Id;
  descricao: string;
}

export interface PlanoSelecionado {
  id: Id;
  descricao: string;
}

export interface DependenteSelecionado {
  id: Id;
  nome: string;
  selecionado?: boolean;
}

export interface DadosSolicitacao {
  operacao: OperacaoSelecionada | null;
  plano: PlanoSelecionado | null;
  dependentes: DependenteSelecionado[];
  observacao: string;
}

export interface DadosSolicitacaoFormulario {
  operacao: OperacaoSelecionada | null;
  plano: PlanoSelecionado | null;
  dependentes: DependenteSelecionado[];
  observacao: string;
}

export interface DadosPersistenciaSolicitacao {
  solicitante: DadosSolicitante;
  operacao: OperacaoSelecionada;
  plano: DadosPlano;
  dependentes: DependenteSelecionado[];
}
