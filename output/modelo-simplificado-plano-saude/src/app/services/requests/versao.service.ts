import { Injectable } from '@angular/core';
import { InvokeService } from '../requests/invoke/invoke.service';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VersaoService {
  constructor(private invokeService: InvokeService) {}

  buscarVersao(): Observable<string> {
    // Busca da versão por ws
    return this.invokeService
      .obterDadosXT('br.com.senior.validacao.composable', 'getVersao', 'rubi', {
        fluxo: environment.fluxo,
      })
      .pipe(
        map((response) => {
          const v = JSON.parse(JSON.stringify(response)) as {
            versao: string;
          };
          return v.versao;
        })
      );

    // Busca de versão fixa para desenvolvimento
    //return of('1.0.0');
  }
}
