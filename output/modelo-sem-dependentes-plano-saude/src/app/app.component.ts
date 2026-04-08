import { Component, OnInit } from '@angular/core';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { WfFormData } from '@core/service/workflow/workflow-cockpit/dist/workflow-cockpit';
import { WorkflowService } from '@core/service/workflow/workflow.service';
import { VersaoService } from '@services/requests/versao.service';
import { ComponenteLoadingService } from '@services/utils/componente-loading.service';
import { NotificationService } from '@services/utils/notification.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor(
    private versaoService: VersaoService,
    private router: Router,
    private wfService: WorkflowService,
    private notification: NotificationService,
    public componenteLoadingService: ComponenteLoadingService
  ) {
    this.wfService.onSubmit(this.abortSubmit.bind(this))
  }

  private abortSubmit():WfFormData | undefined {
    this.notification.formError("Carregando formulário, aguarde!")
    this.wfService.abortSubmit();
    return
  }

  get validaVersao(): boolean {
    return environment.valida_versao;
  }

  get versao(): string {
    return environment.versao;
  }

  get ambiente(): string {
    return environment.ambiente;
  }

  versaoInvalida = this.validaVersao;
  complete = false;

  estaNavegando = false;
  mensagemRotaAtual = 'Carregando...';

  get estaExibindoLoading(): boolean {
    return this.estaNavegando || this.componenteLoadingService.estaCarregando;
  }

  ngOnInit(): void {
    if (environment.valida_versao) {
      this.versaoService.buscarVersao().subscribe((v) => {
        this.versaoInvalida = v !== this.versao;
        this.complete = true;
      });
    } else {
      this.complete = true;
    }

    if (environment.ambiente == 'H') {
      document.body.classList.add('env-homologacao');
    } else {
      document.body.classList.remove('env-homologacao');
    }
    this.configurarLoadingNavegacao();
  }

  private configurarLoadingNavegacao(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.estaNavegando = true;
        this.mensagemRotaAtual = this.obterMensagemLoading(event.url);
        this.componenteLoadingService.iniciarLoadingDinamico();
      }

      if (event instanceof NavigationEnd) {
        this.estaNavegando = false;
      }

      if (
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.estaNavegando = false;
        this.componenteLoadingService.finalizarLoadingDinamico();
      }
    });
  }

  private obterMensagemLoading(url: string): string {
    const mensagensRotas: Record<string, string> = {
      // solicitacao: "Carregando solicitação" //EXEMPLO
      // Caso queira adicionar mensagens específicas para outras rotas, pode fazer aqui
    };

    for (const rota in mensagensRotas) {
      if (url.includes(rota)) {
        return mensagensRotas[rota];
      }
    }

    return 'Carregando página...';
  }
}
