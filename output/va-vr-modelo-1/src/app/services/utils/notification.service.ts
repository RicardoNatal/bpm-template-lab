import { Injectable } from "@angular/core";
import { MessageService } from "primeng/api";
import { throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private messageService: MessageService) {}


  formError(message:string, throwError:boolean = false): void{
    this.messageService.add({
      severity: 'error',
      summary: 'Campos inválidos.',
      detail:
        message ||
        'Formulário inválido, verifique os campos e tente novamente.',
      sticky: true,
    })
    if(throwError){
      throw new Error(message || 'Formulário inválido, verifique os campos e tente novamente.')
    }
  }

  requestError(message: string, throwError:boolean = false): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erro na requisição.',
      detail:
        message ||
        'Não foi possível efetuar a solicitação, tente novamente mais tarde!',
      sticky: true,
    });
    if(throwError){
      throw new Error(message || 'Não foi possível efetuar a solicitação, tente novamente mais tarde!')
    }
  }

  parseError(message: string, throwError:boolean = false): void{
    this.messageService.add({
      severity: 'error',
      summary: 'Erro ao tratar dados',
      detail:
        message ||
        'Não foi possível converter os formatos de dados!',
      sticky: true,
    });
    if(throwError){
      throw new Error(message || 'Não foi possível converter os formatos de dados!')
    }
  }
  
  genericError(message: string, throwError:boolean = false): void{
    this.messageService.add({
      severity: 'error',
      summary: 'Ocorreu um erro!',
      detail: message,
      sticky: true,
    });
    if(throwError){
      throw new Error(message)
    }
  }
  
}