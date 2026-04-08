import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WorkflowService } from '../service/workflow/workflow.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private workflowService: WorkflowService) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const BEARER_TOKEN = this.workflowService.getToken();
    const BLOB_SERVICE = 'br-com-senior-blob-service-storage';

    // Ignorar interceptor para requisições para o serviço de blob
    // Isso é necessário para evitar problemas de CORS,
    // pois o serviço de blob não aceita o cabeçalho Authorization
    if (req.url.includes(BLOB_SERVICE)) {
      return next.handle(req);
    }
    
    req = req.clone({
      headers: req.headers
        .set('Authorization', BEARER_TOKEN)
        .set('Content-Type', 'application/json')
        .set('client_id', environment.client_id || '')
    });

    return next.handle(req);
  }
}
