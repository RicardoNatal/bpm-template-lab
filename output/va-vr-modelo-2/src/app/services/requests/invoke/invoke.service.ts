import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  catchError,
  EMPTY,
  firstValueFrom,
  map,
  Observable,
  take,
  throwError,
} from 'rxjs';
import { OutputData, ResponseModel } from '../models/response.model';
import { environment } from 'src/environments/environment';
import { parse } from 'date-fns';
import { ErrorMessages } from '../models/error.model';
import { TicketRequestResponse } from '../models/ticket-request-response.model';
import { Module } from '@services/constants';
import { buildBody } from './body.make';
import { IGNORE_ERROR_HANDLER } from '@core/interceptor/error.interceptor';
import { WorkflowService } from '@core/service/workflow/workflow.service';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class InvokeService {
  private readonly errorMessages: ErrorMessages = {
    401: 'Erro de autenticação. Verifique suas credenciais e tente novamente.',
    403: 'Acesso negado. Você não tem permissão para acessar este recurso.',
    404: 'Recurso não encontrado.',
    500: 'Erro no servidor. Por favor, tente novamente mais tarde.',
    504: 'Tempo de resposta esgotado. O servidor não conseguiu responder a solicitação no tempo limite.',
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private wfService: WorkflowService,
  ) {}

  obterDadosXT<T extends OutputData>(
    service: string,
    port: string,
    module: Module,
    args: Record<string, string | number | Date> = {},
    typedResponse: boolean | unknown = false,
  ): Observable<T> {
    const body = buildBody(
      service,
      port,
      args,
      module != 'rubi' ? module : 'rubi',
    );

    return this.http.post<ResponseModel<T>>(environment.urls.invoke, body).pipe(
      take(1),
      map((response) => {
        this.handleRespostaXT(response.outputData);

        if (typedResponse) {
          return this.parseResponse<T>(response.outputData).outputData;
        }

        return response.outputData;
      }),
      catchError((err) => {
        console.error('Ocorreu um erro no obterDadosXT:', err);
        throw new Error(
          'Ocorreu um erro ao carregar os dados, favor contate um administrador.',
        );
      }),
    );
  }

  async verificaUsuarioNoPapelPlataforma(
    nomeUsuario: string,
    nomePapel: string | string[],
  ): Promise<boolean> {
    const response = await firstValueFrom(
      this.http.post<{
        roles: { id: string; name: string; description: string }[];
      }>(
        'https://platform.senior.com.br/t/senior.com.br/bridge/1.0/rest/platform/authorization/queries/getUserDetailRoles',
        { user: nomeUsuario },
      ),
    );

    const papeisValidos = (
      Array.isArray(nomePapel) ? nomePapel : [nomePapel]
    ).map((p) => p.toUpperCase());

    return response.roles.some((role) =>
      papeisValidos.includes(role.name.toUpperCase()),
    );
  }

  envioEmailUsarioSeniorX(
    assunto: string,
    corpo: string,
    destinatarios: string[],
  ): Observable<ResponseModel<OutputData>> {
    const body = {
      inputData: {
        subject: assunto,
        content: corpo,
        to: destinatarios,
      },
      id: environment.email_plugin_id,
    };

    return this.http
      .post<ResponseModel<OutputData>>(environment.urls.invoke, body)
      .pipe(
        take(1),
        map((response) => {
          const { responseCode: codigoResposta, message: error } =
            response.outputData || {};
          if (codigoResposta !== 200) {
            this.handleErrorResponse(codigoResposta, error);
          }
          return response;
        }),
      );
  }

  private handleRespostaXT(response: OutputData) {
    this.handleErrorResponse(response.responseCode, response.message);
    if (response.message) {
      throw new Error(response.message);
    }
    if (response.responseCode == 200) {
      if (!response.ARetorno || response.ARetorno.toLocaleUpperCase() != 'OK') {
        throw new Error(
          response?.ARetorno || 'Não foi encontrado o ARetorno do Webservice!',
        );
      }
    }
    return;
  }

  private handleErrorResponse(
    codigoResposta: number,
    error: string | undefined,
  ) {
    if (codigoResposta >= 500) {
      if (codigoResposta === 504) {
        throw new Error(this.errorMessages[504]);
      }
      throw new Error(this.errorMessages[500]);
    }
    if (codigoResposta >= 400) {
      this.handleClientError(error);
      return;
    }
    const errorMessage = this.errorMessages[codigoResposta];
    if (errorMessage) {
      throw new Error(errorMessage);
    }
  }

  private handleClientError(error: string | undefined) {
    const userNotFoundMessage =
      'Não foi possível localizar o usuário no XT, verifique se está configurado corretamente no módulo Administração de Pessoas > Colaboradores > Ficha Cadastral > Empregados.';
    throw new Error(
      error?.includes(userNotFoundMessage)
        ? userNotFoundMessage
        : error
          ? error
          : 'Erro na requisição. Verifique os dados enviados.',
    );
  }

  private parseResponse<T extends OutputData>(data: T): ResponseModel<T> {
    const parsedObj = this.convertStringsToTypes(data);
    return { outputData: parsedObj };
  }

  private convertStringsToTypes<T>(obj: T): T {
    for (const key in obj) {
      const type = key.substring(0, 1).toLocaleUpperCase();

      if (type === 'L' && obj[key] && Array.isArray(obj[key])) {
        obj[key] = (obj[key] as unknown[]).map((item: unknown) =>
          this.convertStringsToTypes(item),
        ) as T[Extract<keyof T, string>];
      } else if (type === 'L' && obj[key] && typeof obj[key] === 'object') {
        obj[key] = [
          this.convertStringsToTypes(obj[key]),
        ] as unknown as T[Extract<keyof T, string>];
      } else if (typeof obj[key] === 'string') {
        if (obj[key] && type && type === 'N') {
          obj[key] = parseFloat(obj[key]) as unknown as T[Extract<
            keyof T,
            string
          >];
        }
        if (obj[key] && type && type === 'D') {
          if (typeof obj[key] === 'string') {
            obj[key] = this.parseBrazilianDate(
              obj[key],
            ) as unknown as T[Extract<keyof T, string>];
          }
        }
      }
    }
    return obj;
  }

  private parseBrazilianDate(dateString: string): Date | null {
    try {
      return parse(dateString, 'dd/MM/yyyy', new Date());
    } catch (error) {
      console.error('Error parsing date:', error);
      throw new Error('Formato de data inválido');
    }
  }

  post(
    service: string,
    port: string,
    args?: Record<string, string | number | Date>,
    usuarioLogin?: string,
    ticketRequest?: string,
  ) {
    const payload = {
      inputData: {
        port: port,
        server: environment.server,
        encryption: '3',
        password: '',
        user: '',
        service: service,
        module: 'rubi',
        ...{
          ...args,
          aUsuarioSolicitante: usuarioLogin,
        },
      },
      ticketRequest: ticketRequest || '',
      id: 'f2200c3b-c7df-4040-9613-34f697b75889',
    };

    return this.http
      .post<ResponseModel<any>>(
        ticketRequest
          ? environment.urls.extended_timeout
          : environment.urls.invoke,
        payload,
        {
          context: new HttpContext().set(IGNORE_ERROR_HANDLER, true),
        },
      )
      .pipe(
        map((response) => {
          const { responseCode: codigoResposta, message: error } =
            response?.outputData || {};

          if (response.outputData && codigoResposta !== 200) {
            this.handleErrorResponse(codigoResposta, error);
            throw new Error(error);
          }
          return response;
        }),
      );
  }

  private async tratarRespostaTimeout<T>(
    data: TicketRequestResponse,
  ): Promise<[T | undefined, boolean]> {
    if (data.response) {
      if (JSON.parse(data.response).outputData?.responseCode != 200) {
        throw Error(
          'Ocorreu um erro no serviço, favor tente mais tarde ou contate um administrador',
        );
      }

      const retorno = JSON.parse(data.response)['outputData'] as T;
      return [retorno, true];
    } else if (data?.message) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro de chamada',
        detail: data.message,
        sticky: true,
      });
      return [undefined, true];
    }

    return [undefined, false];
  }

  async postComTimeoutExtendido<T>(
    service: string,
    port: string,
    args?: Record<string, string | number | Date>,
  ): Promise<T> {
    try {
      const aUsuarioSolicitante = this.wfService.getUser().username;
      const uuidTicket = crypto.randomUUID();

      this.post(
        service,
        port,
        args,
        aUsuarioSolicitante,
        uuidTicket,
      ).subscribe();

      let respondeu = false;
      let resposta: T | undefined = undefined;

      while (!respondeu) {
        const data: TicketRequestResponse = await firstValueFrom(
          this.buscaRespostaRequisicaoBpmTimeout(uuidTicket),
        );
        [resposta, respondeu] = await this.tratarRespostaTimeout<T>(data);
        if (!respondeu) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
      return resposta as T;
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro de chamada',
        detail: `Erro ao efetuar a solicitação, tente novamente mais tarde! Detalhes: ${error?.message ?? ''}`,
        sticky: true,
      });
      throw error;
    }
  }

  buscaRespostaRequisicaoBpmTimeout(
    ticketRequest: string,
  ): Observable<TicketRequestResponse> {
    const body = { ticketRequest };

    return this.http.post<TicketRequestResponse>(
      'https://platform.senior.com.br/t/senior.com.br/bridge/1.0/rest/platform/bpm_timeout/queries/getTicketResponse',
      body,
      { headers: { client_id: '7705c63a-d618-4f7d-8ec9-a7147898e73f' } },
    );
  }
}
