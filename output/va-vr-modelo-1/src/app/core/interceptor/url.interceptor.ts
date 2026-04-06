import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnvService } from '../env/env.service';

@Injectable()
export class UrlInterceptor implements HttpInterceptor {
  constructor(public env: EnvService) {}

  private readonly LOCAL_URLS: string[] = ['/assets/'];

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    /*if (
      this.env.apiUrl &&
      (req.url.startsWith(environment.backend.baseUrl) ||
        req.url.startsWith(environment.connect.baseUrl))
    ) {
      const path = req.url;
      const apiUrl = this.env.apiUrl;

      req = req.clone({
        url: apiUrl + path,
      });
    }*/

    return next.handle(req);
  }

  /*shouldIntercept(url: string): boolean {
    for (const path of this.LOCAL_URLS) {
      if (url.startsWith(path) || url.startsWith(`/${path}`)) {
        return false;
      }
    }

    if (!this.env.apiUrl) {
      return false;
    }

    return url.startsWith(environment.backend.baseUrl);
  }*/
}
