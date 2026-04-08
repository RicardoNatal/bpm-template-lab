import { AfterViewInit, OnInit } from "@angular/core";
import { WfFormData } from "@core/service/workflow/workflow-cockpit/dist/workflow-cockpit";
import { VariaveisProcessoG7DTO } from "../shared/models/variaveis-processo.model";

export interface EtapaModel extends OnInit, AfterViewInit{
  ngOnInit():void;
  ngAfterViewInit():void;
  inicializarFormulario(...args: any[]): void;
  formulariosValidos():boolean;
  montaFormData(...args: any[]): VariaveisProcessoG7DTO;
  enviarFormulario(...args: any[]): Promise<WfFormData | undefined> | WfFormData | undefined ;
}