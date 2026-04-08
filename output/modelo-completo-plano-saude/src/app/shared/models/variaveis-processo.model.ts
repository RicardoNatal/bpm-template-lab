import { DadosColaborador, DadosSolicitante } from "./colaboradores.model";
import { DadosSolicitacao } from "./solicitacao.model";

export interface VariaveisProcessoDTO{
  nomeSolicitante: string;
  dadosSolicitante: DadosSolicitante;
  dadosColaborador: DadosColaborador;
  dadosSolicitacao: DadosSolicitacao;
  ehGestor: string;
}

export interface VariaveisProcessoG7DTO{
  nomeSolicitante?: string;
  dadosSolicitante?: string;
  dadosColaborador?: string;
  ehGestor?: string;
  dadosSolicitacao?: string;
  observacaoGestor?: string;
  observacaoRH?: string;
  dadosAnaliseRH?: string;

  //Notificações / relatórios
  nomeMatriculaSol?: string;
  codNomeEmpresaSol?: string;
  codNomeFilialSol?: string;
  centroCustoSol?: string;
  nomeMatriculaCol?: string;
  codNomeEmpresaCol?: string;
  codNomeFilialCol?: string;
  centroCustoCol?: string;
  dataSol?: string;
  emailColaborador?: string;
  statusSolicitacao?: 'Em andamento' | 'Aprovado' | 'Reprovado';
}
