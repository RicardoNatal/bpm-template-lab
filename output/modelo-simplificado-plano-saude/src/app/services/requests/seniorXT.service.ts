import { from, map, Observable } from 'rxjs';
import {
  DadosColaboradorDTO,
  RetornoColaboradoresDTO,
  RetornoDadosSolicitanteDTO,
} from 'src/app/shared/models/colaboradores.model';
import { InvokeService } from './invoke/invoke.service';
import { ResultListInterface } from '@senior-hcm-service-tower/hst-lookup';
import { Injectable } from '@angular/core';
import { rubi } from '@services/constants';
import { RetornoDadosPlanoDTO } from 'src/app/shared/models/plano.model';
import { DateUtils } from 'src/app/utils/date-utils';
import {
  DependenteConfig,
  DependentesResult,
  RetornoDependentesDTO,
} from 'src/app/shared/models/dependente.model';
import { WfFormData } from '@core/service/workflow/workflow-cockpit/dist/workflow-cockpit';
import { DadosPersistenciaSolicitacao, DadosSolicitacao } from 'src/app/shared/models/solicitacao.model';

@Injectable({ providedIn: 'root' })
export class SeniorXTService {
  constructor(private invoke: InvokeService) {}

  private toNumber(value: unknown, fallback = 0): number {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }

  dadosSolicitante(aNomUsu: string): Observable<RetornoDadosSolicitanteDTO> {
    console.log('Obtendo dados do solicitante para o usuário:', aNomUsu);
    return from(
      this.invoke.postComTimeoutExtendido<RetornoDadosSolicitanteDTO>(
        rubi.geral.service,
        rubi.geral.ports.solicitante,
        {
          aNomUsu,
        },
      ),
    ).pipe(
      map((response) => {
        return {
          ...response,
          NNumEmp: this.toNumber(response.NNumEmp),
          NTipCol: this.toNumber(response.NTipCol),
          NNumCad: this.toNumber(response.NNumCad),
          NCodFil: this.toNumber(response.NCodFil),
          ANomCCU: (response as any).ANomCCU || (response as any).ANomCcu || '',
        } as RetornoDadosSolicitanteDTO;
      }),
    );
    // PIPE(MAP()) aqui apenas se for transformar algum dado antes de retornar
    // EX: buscaColaboradores
    // .pipe(
    //   map((response)=>{
    //     return response
    //   })
    // )
  }

  planosDeSaude(
    aFilter: string = '',
    nTop: number = 10,
    nSkip: number = 0,
  ): Observable<RetornoDadosPlanoDTO> {
    return from(
      this.invoke.postComTimeoutExtendido<RetornoDadosPlanoDTO>(
        rubi.beneficios.service,
        rubi.beneficios.ports.planos,
        {
          aFilter,
          nTop,
          nSkip,
        },
      ),
    ).pipe(
      map((response) => {
        return {
          ...response,
          NSize: this.toNumber((response as any).NSize),
          LPlanos: (response.LPlanos || []).map((plano) => ({
            ...plano,
            NCodPla: this.toNumber(plano.NCodPla),
            NCodOem: this.toNumber(plano.NCodOem),
          })),
        } as RetornoDadosPlanoDTO;
      }),
    );
  }

  gravarPlanoSaude(dados: DadosPersistenciaSolicitacao): void {
      const dependentesSelecionados = (dados?.dependentes || [])
        .filter((dependente) => dependente?.selecionado !== false)
        .map((dependente: any) => {
          const codigoDependente = this.toNumber(
            dependente?.id ?? dependente?.codigo_dependente ?? dependente?.NCodDep,
            NaN,
          );
          return {
            nCodDep: codigoDependente,
          };
        })
        .filter((dependente) => !Number.isNaN(dependente.nCodDep));

      this.invoke.postComTimeoutExtendido(
        rubi.beneficios.service,
        rubi.beneficios.ports.gravar,
        {
          nNumEmp: dados.solicitante.NNumEmp,
          nTipCol: dados.solicitante.NTipCol,
          nNumCad: dados.solicitante.NNumCad,
          aTipOpe: dados.operacao.id,
          nCodOem: dados.plano.NCodOem,
          nCodPla: dados.plano.NCodPla,
          lDependentes: dependentesSelecionados,
        }
      ).then(() => {
        console.log('Plano de saúde gravado com sucesso.');
      }).catch((err) => {
        throw new Error('Erro ao gravar plano de saúde: ' + err.message);
      });
  }

  dadosDependentes(
    nNumEmp: number,
    nTipCol: number,
    nNumCad: number,
    aFiltro: string = '',
    nTop: number = 10,
    nSkip: number = 0,
  ): Observable<DependentesResult> {
    console.log('Obtendo dados dos dependentes para o colaborador:', {
      NTipCol: nTipCol,
      NNumEmp: nNumEmp,
      NNumCad: nNumCad,
    });
    return from(
      this.invoke.postComTimeoutExtendido<RetornoDependentesDTO>(
        rubi.beneficios.service,
        rubi.beneficios.ports.dependentes,
        {
          nNumEmp,
          nTipCol,
          nNumCad,
          aFiltro,
          nTop,
          nSkip,
        },
      ),
    ).pipe(
      map((response) => {
        const listaDependentes = Array.isArray(response.LDependentes)
          ? response.LDependentes
          : response.LDependentes
            ? [response.LDependentes]
            : [];

        const dependentes = listaDependentes.map((dependente) => ({
          codigo_dependente: this.toNumber(dependente.NCodDep),
          nome: dependente.ANomDep,
          parentesco: dependente.AGraPar,
          data_nascimento: DateUtils.dataParaTexto(dependente.DDatNas) || '',
          codigo_plano:
            dependente.NCodPla === null || dependente.NCodPla === undefined
              ? null
              : this.toNumber(dependente.NCodPla),
        }));

        const primeiroRegistro = listaDependentes[0];
        const codigoPlanoPrimeiro =
          primeiroRegistro?.NCodPla === null ||
          primeiroRegistro?.NCodPla === undefined
            ? null
            : this.toNumber(primeiroRegistro?.NCodPla);
        const nomePlanoPrimeiro = primeiroRegistro?.ANomPla?.trim();
        const colaboradorSemPlano = !codigoPlanoPrimeiro && !nomePlanoPrimeiro;

        return {
          dependentes,
          codigoPlano:
            response.NCodPla === null || response.NCodPla === undefined
              ? null
              : this.toNumber(response.NCodPla),
          nomePlano: response.ANomPla ?? null,
          colaboradorSemPlano,
        };
      }),
    );
  }

  buscaColaboradores(
    nTop: number = 10,
    nSkip: number = 0,
    aFilter: string = '',
    nTipCol: number = 0,
    nNumEmp: number = 0,
    nNumCad: number = 0,
    args?: Record<string, string>,
  ): Observable<ResultListInterface<DadosColaboradorDTO>> {
    console.log(
      'Buscando colaboradores com filtro:',
      aFilter,
      'e args:',
      args,
      'para o solicitante:',
      {
        NTipCol: nTipCol,
        NNumEmp: nNumEmp,
        NNumCad: nNumCad,
      },
    );
    return from(
      this.invoke.postComTimeoutExtendido<RetornoColaboradoresDTO>(
        rubi.geral.service,
        rubi.geral.ports.colaboradores,
        {
          nTop,
          nSkip,
          aFilter,
          nTipCol,
          nNumEmp,
          nNumCad,
          ...args,
        },
      ),
    ).pipe(
      map((response) => {
        const resultList: ResultListInterface<DadosColaboradorDTO> = {
          result: (response.LColaboradores || []).map((colaborador) => ({
            ...colaborador,
            NNumEmp: this.toNumber(colaborador.NNumEmp),
            NTipCol: this.toNumber(colaborador.NTipCol),
            NNumCad: this.toNumber(colaborador.NNumCad),
            NCodFil: this.toNumber(colaborador.NCodFil),
          })),
          size: this.toNumber(response.NSize),
        };
        return resultList;
      }),
    );
  }
}
