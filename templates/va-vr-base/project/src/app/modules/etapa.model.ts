import { AfterViewInit, OnInit } from "@angular/core";
import { WfFormData } from "@core/service/workflow/workflow-cockpit/dist/workflow-cockpit";
import { VariaveisProcessoG7DTO } from "../shared/models/variaveis-processo.model";

/**
 * Contrato base para qualquer etapa do fluxo.
 * Cobre tanto etapas de leitura quanto etapas editáveis.
 */
export interface EtapaModel extends OnInit, AfterViewInit {
  ngOnInit(): void;
  ngAfterViewInit(): void;
  inicializarFormulario(...args: any[]): void;
  validarFormularios(): boolean;
  montaFormData(...args: any[]): VariaveisProcessoG7DTO;
  enviarFormulario(...args: any[]): Promise<WfFormData | undefined> | WfFormData | undefined;
}

/**
 * Contrato para etapas somente-leitura (ex: Detalhes).
 * Não exige validação real nem montagem de dados — apenas avança o fluxo.
 */
export interface EtapaLeituraModel extends OnInit, AfterViewInit {
  ngOnInit(): void;
  ngAfterViewInit(): void;
  inicializarFormulario(...args: any[]): void;
}

