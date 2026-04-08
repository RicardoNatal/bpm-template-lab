import { OutputData } from '@services/requests/models/response.model';

export interface DependenteConfig{
  codigo_dependente: number;
  nome: string;
  parentesco: string;
  data_nascimento: string;
  codigo_plano?: number | null;
}

export interface DependenteDTO {
  NCodDep: number;
  ANomDep: string;
  AGraPar: string;
  DDatNas: string | Date;
  NCodPla?: number | null;
  ANomPla?: string | null;
}

export interface RetornoDependentesDTO extends OutputData {
  LDependentes: DependenteDTO[];
  size: number;
  NCodPla?: number;
  ANomPla?: string;
}

export interface DependentesResult {
  dependentes: DependenteConfig[];
  codigoPlano: number | null;
  nomePlano: string | null;
  colaboradorSemPlano: boolean;
}
