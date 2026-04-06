import { DadosValeModel } from "./vale.model";

export interface DadosSolicitacaoModel {
  beneficioSelecionado: DadosValeModel[]
  termo: boolean,
  observacaoSolicitante: string
}
