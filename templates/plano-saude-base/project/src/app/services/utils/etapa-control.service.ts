import { Injectable } from '@angular/core';

export enum EtapaWorkflow {
  DETALHES = 'Detalhes',
  SOLICITACAO = 'Solicitação'
  // Adicione outras etapas conforme necessário
}

@Injectable({
  providedIn: 'root',
})
export class EtapaControlService {
  private etapaAtual: EtapaWorkflow = EtapaWorkflow.DETALHES;

  setEtapaAtual(etapa: EtapaWorkflow): void {
    this.etapaAtual = etapa;
  }

  getEtapaAtual(): EtapaWorkflow | null {
    return this.etapaAtual;
  }

  isEtapaSolicitacao(): boolean {
    return this.etapaAtual === EtapaWorkflow.SOLICITACAO;
  }

  deveExecutarServicosDepesquisa(): boolean {
    return this.isEtapaSolicitacao();
  }

  isEtapa(...etapas: EtapaWorkflow[]): boolean {
    return etapas.includes(this.etapaAtual);
  }
}
