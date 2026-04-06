import { ResultListInterface, SearchConfigModel, ServiceSearch } from "@senior-hcm-service-tower/hst-lookup";
import { DadosColaboradorDTO } from "../../../shared/models/colaboradores.model";
import { catchError, EMPTY, finalize, Observable, take } from "rxjs";
import { SeniorXTService } from '../seniorXT.service';
import { Injectable } from "@angular/core";
import { NotificationService } from "@services/utils/notification.service";

@Injectable({ providedIn: 'root' })
export class ColaboradoresService implements ServiceSearch<DadosColaboradorDTO> {

  ANomGes: string = "";
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
    
    return this.seniorXT.buscaColaboradores(top, skip, filter, this.ANomGes, args).pipe(
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