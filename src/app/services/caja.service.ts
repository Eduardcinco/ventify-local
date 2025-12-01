import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CajaService {
  private base = `${environment.apiUrl}/api/caja`;
  // Standardized caja state: { abierta: boolean, caja: Caja|null }
  private currentSubject = new BehaviorSubject<{ abierta: boolean; caja: any | null }>({ abierta: false, caja: null });
  current$ = this.currentSubject.asObservable();

  constructor(private http: HttpClient, private auth: AuthService) {}

  getCurrent(): Observable<{ abierta: boolean; caja: any | null }> {
    // Backend now scopes by token; params are optional
    const negocioId = this.auth.getBusinessId();
    const params = negocioId ? new HttpParams().set('negocioId', String(negocioId)) : undefined;
    return this.http.get<{ abierta: boolean; caja: any | null }>(`${this.base}/current`, { params }).pipe(
      tap((resp) => this.currentSubject.next(resp))
    );
  }

  open(payload: { negocioId?: number; montoInicial: number }): Observable<{ abierta: true; caja: any }> {
    const negocioId = this.auth.getBusinessId();
    const body = { ...payload, negocioId };
    return this.http.post<{ abierta: true; caja: any }>(`${this.base}/open`, body).pipe(
      tap((resp) => this.currentSubject.next(resp))
    );
  }

  close(payload: { id: number; montoCierre?: number; resumen?: string }): Observable<{ abierta: false; caja: any }> {
    return this.http.post<{ abierta: false; caja: any }>(`${this.base}/close`, payload).pipe(
      tap((resp) => this.currentSubject.next(resp))
    );
  }

  setCurrent(abierta: boolean, caja: any | null) {
    this.currentSubject.next({ abierta, caja });
  }
}
