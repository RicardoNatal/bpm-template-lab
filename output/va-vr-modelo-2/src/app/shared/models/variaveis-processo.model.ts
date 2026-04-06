import { DadosSolicitante } from './colaboradores.model';
import { DadosSolicitacaoModel } from './solicitacao.model';
import { DadosValeModel } from './vale.model';

export interface VariaveisProcessoDTO {
  nomeSolicitante: string;
  dadosSolicitante: DadosSolicitante;
  dadosSolicitacao: DadosSolicitacaoModel;
  beneficioAtual: DadosValeModel[];
  observacaoRh: string;
  codValeAtual: number;
  codNovoVale: number;
  valesPorEmpresa: DadosValeModel[];
}

export interface VariaveisProcessoG7DTO {
  nomeSolicitante?: string;
  matriculaSolicitante?: string;
  dadosSolicitante?: string;
  dadosSolicitacao?: string;
  dadosAnaliseRH?: string;
  beneficioAtual?: string;
  codNomeValeNovo?: string;
  observacaoRh?: string;
  observacaoSolicitante?: string;
  codValeAtual?: string;
  nomValeAtual?: string;
  codNovoVale?: string;
  nomNovoVale?: string;
  codNomeValesAtuais?: string;
  valesPorEmpresa?: string;

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
