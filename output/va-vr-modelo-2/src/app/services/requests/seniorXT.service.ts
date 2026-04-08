import { from, map, Observable, take } from 'rxjs';
import {
  DadosColaboradorDTO,
  RetornoColaboradoresDTO,
  RetornoDadosSolicitanteDTO,
} from 'src/app/shared/models/colaboradores.model';
import { InvokeService } from './invoke/invoke.service';
import { ResultListInterface } from '@senior-hcm-service-tower/hst-lookup';
import { Injectable } from '@angular/core';
import { rubi } from '@services/constants';
import { DadosValeModel, ValesModel } from 'src/app/shared/models/vale.model';

@Injectable({ providedIn: 'root' })
export class SeniorXTService {
  constructor(private invoke: InvokeService) {}

  dadosSolicitante(ANomUsu: string): Observable<RetornoDadosSolicitanteDTO> {
    return from(
      this.invoke.postComTimeoutExtendido<RetornoDadosSolicitanteDTO>(
        'com.senior.automacao.wf.va.vr',
        'retornaSolicitante',
        {},
      ),
    );
  }

  beneficioAtual(): Observable<DadosValeModel[]> {
    return from(
      this.invoke
        .postComTimeoutExtendido<ValesModel>(
          'com.senior.automacao.wf.va.vr',
          'retornaBeneficioAtual',
          {},
        )
        .then((response) =>
          response.LTabVal instanceof Array
            ? response.LTabVal
            : Array(response.LTabVal),
        ),
    );
  }

  valesPorEmpresa() {
    return this.invoke
      .obterDadosXT<ValesModel>(
        'com.senior.automacao.wf.va.vr',
        'retornaValesPorEmpresa',
        'rubi',
      )
      .pipe(
        map((response) => {
          return response.LTabVal instanceof Array
            ? response.LTabVal
            : Array(response.LTabVal);
        }),
      );
  }

  gravarBeneficio(
    NNumCad: number,
    NNumEmp: number,
    NTipCol: number,
    NCodValNovo: number,
    NCodValAtual: number,
  ): Promise<any> {
    return this.invoke.postComTimeoutExtendido(
      'com.senior.automacao.wf.va.vr',
      'gravaBeneficioNovo',
      { NNumCad, NNumEmp, NTipCol, NCodValAtual, NCodValNovo },
    );
  }

  buscaColaboradores(
    top: number = 10,
    skip: number = 0,
    filter: string = '',
    ANomGes: string = '',
    args?: Record<string, string>,
  ): Observable<ResultListInterface<DadosColaboradorDTO>> {
    return this.invoke
      .obterDadosXT<RetornoColaboradoresDTO>(
        rubi.treinamento.service,
        rubi.treinamento.ports.colaboradores,
        rubi.name,
        {
          top,
          skip,
          filter,
          ANomGes,
          ...args,
        },
        true,
      )
      .pipe(
        take(1),
        map((response) => {
          const resultList: ResultListInterface<DadosColaboradorDTO> = {
            result: response.LColaboradores,
            size: response.size,
          };
          return resultList;
        }),
      );
  }
}
