import { ResultListInterface, SearchConfigModel, ServiceSearch } from "@senior-hcm-service-tower/hst-lookup";
import { DadosColaboradorDTO } from "../../../shared/models/colaboradores.model";
import { catchError, EMPTY, finalize, Observable, take } from "rxjs";
import { SeniorXTService } from '../seniorXT.service';
import { Injectable } from "@angular/core";
import { NotificationService } from "@services/utils/notification.service";

@Injectable({ providedIn: 'root' })
export class ColaboradoresService implements ServiceSearch<DadosColaboradorDTO> {

  solicitanteTipCol: number = 0;
  solicitanteNumEmp: number = 0;
  solicitanteNumCad: number = 0;
  loading: boolean = false;

  constructor(
    private seniorXT: SeniorXTService,
    private notification: NotificationService
  ) {}

  find(top = 10, skip = 0, filter: string, args?: Record<string, string>): Observable<ResultListInterface<DadosColaboradorDTO>> {
    //LOADING É UMA CORREÇÃO TEMPORÁRIA AO HST-LOOKUP CHAMAR A ROTA DUPLICADAMENTE
    //SERÁ CORRIGIDO NAS PRÓXIMAS VERSÕES DO STARTER
    if(this.loading){
      return EMPTY;
    }
    this.loading = true;
    console.log('Buscando colaboradores com filtro:', filter, 'e args:', args, 'para o solicitante:', {
      NTipCol: this.solicitanteTipCol,
      NNumEmp: this.solicitanteNumEmp,
      NNumCad: this.solicitanteNumCad,
    });

    return this.seniorXT.buscaColaboradores(
      top,
      skip,
      filter,
      this.solicitanteTipCol,
      this.solicitanteNumEmp,
      this.solicitanteNumCad,
      args,
    ).pipe(
      take(1),
      catchError(err => {
        console.error(err);
        this.notification.requestError(err);
        return EMPTY;
      }),
      finalize(()=>{
        this.loading = false;
      })
    );
  }

  definirSolicitante(dados: Pick<DadosColaboradorDTO, 'NTipCol' | 'NNumEmp' | 'NNumCad'>): void {
    this.solicitanteTipCol = dados?.NTipCol ?? 0;
    this.solicitanteNumEmp = dados?.NNumEmp ?? 0;
    this.solicitanteNumCad = dados?.NNumCad ?? 0;
  }

  retornaConfiguracao(): SearchConfigModel {
    return {
      filterType: [
        {
          label: "Matrícula",
          field: "NNumCad"
        },
        {
          label: "Nome",
          field: "ANomFun"
        }
      ],
      patternField: "${NNumCad} - ${ANomFun}",
      service: this
    }
  }
}
