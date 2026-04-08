import { OutputData } from '@services/requests/models/response.model';

export class DadosPlano {
  NCodPla: number = 0;
  ANomPla: string = 'N/A';
  NCodOem: number = 0;

  constructor() {}
}

export interface RetornoDadosPlanoDTO extends OutputData {
  LPlanos: DadosPlano[];
  size: number;
}
