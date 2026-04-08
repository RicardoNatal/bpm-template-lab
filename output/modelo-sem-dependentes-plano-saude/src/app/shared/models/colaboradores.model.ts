import { OutputData } from "@services/requests/models/response.model";

export interface DadosColaboradorDTO{
  NNumEmp: number,
  NTipCol: number,
  NNumCad: number,
  ANomFun: string,
  ANomEmp: string,
  NCodFil: number,
  ANomFil: string,
  ANomCCU: string
}

export class DadosColaborador implements DadosColaboradorDTO{
  NNumEmp: number = 0;
  NTipCol: number = 0;
  NNumCad: number = 0;
  ANomFun: string = "N/A";
  ANomEmp: string = "N/A";
  NCodFil: number = 0;
  ANomFil: string = "N/A";
  ANomCCU: string = "N/A";

  constructor(){
  }
}

export interface DadosSolicitanteDTO extends DadosColaboradorDTO{
  AEhGestor: string;
}

export class DadosSolicitante implements DadosSolicitanteDTO{
  NNumEmp: number = 0;
  NTipCol: number = 0;
  NNumCad: number = 0;
  ANomFun: string = "N/A";
  ANomEmp: string = "N/A";
  NCodFil: number = 0;
  ANomFil: string = "N/A";
  ANomCCU: string = "N/A";
  AEhGestor: string = "N/A";

  constructor(){
  }
}


export interface RetornoDadosSolicitanteDTO extends DadosSolicitanteDTO, OutputData {
}

export interface RetornoColaboradoresDTO extends OutputData {
  LColaboradores: DadosColaboradorDTO[];
  NSize: number;
}
