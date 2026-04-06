import { OutputData } from '@services/requests/models/response.model';

export interface ValeModel {
  nCodVal: number;
  aDesVal: string;
}

export interface DadosValeModel {
  NCodVal: number;
  NTabEve: number;
  ADesVal: string;
}

export interface ValesModel extends OutputData {
  LTabVal: DadosValeModel[];
  ARetorno: string;
  size: number;
}
