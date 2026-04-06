import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ComponenteLoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  iniciarLoadingDinamico(): void {
    this.loadingSubject.next(true);
  }

  finalizarLoadingDinamico(): void {
    this.loadingSubject.next(false);
  }

  get estaCarregando(): boolean {
    return this.loadingSubject.value;
  }
}
