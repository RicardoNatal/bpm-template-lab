import { Injectable } from '@angular/core';
import { StepId } from '@template/types/template.types';

/**
 * Enum canônico das etapas do fluxo.
 * Os valores DEVEM corresponder exatamente aos StepId declarados em template.types.ts.
 * Para adicionar uma etapa, declare em StepId e registre em WORKFLOW_STEPS.
 *
 * @deprecated Prefira usar StepId diretamente. Mantido para compatibilidade.
 */
export enum EtapaWorkflow {
  DETALHES = 'detalhes',
  SOLICITACAO = 'solicitacao',
  REVISAO = 'revisao',
  ANALISE_RH = 'analise-rh',
}

@Injectable({
  providedIn: 'root',
})
export class EtapaControlService {
  private etapaAtual: StepId = 'detalhes';

  /** Define a etapa atual. Aceita StepId (config) ou EtapaWorkflow (legado). */
  setEtapaAtual(etapa: StepId): void {
    this.etapaAtual = etapa;
  }

  getEtapaAtual(): StepId {
    return this.etapaAtual;
  }

  isEtapa(...etapas: StepId[]): boolean {
    return etapas.includes(this.etapaAtual);
  }
}
