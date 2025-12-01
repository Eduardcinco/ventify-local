import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { ToastService } from './toast.service';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private auth: AuthService, private router: Router, private toast: ToastService) {}

  private addToken(req: HttpRequest<any>, token: string | null) {
    if (!token) return req;
    return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();
    const authReq = token ? this.addToken(req, token) : req;
    return next.handle(authReq).pipe(
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          // Detect token version invalidation or hard auth failure
          const msg = (err.error?.message || '').toLowerCase();
          const isTokenVersionMismatch = msg.includes('version') || msg.includes('tokenversion');
          const isRefreshEndpoint = req.url.includes('/refresh');
          if (isTokenVersionMismatch || isRefreshEndpoint) {
            this.toast.warning('Sesión invalidada. Inicia sesión nuevamente.');
            this.auth.logout();
            this.router.navigate(['/login']);
            return throwError(() => err);
          }
          return this.handle401Error(req, next);
        }
        return throwError(() => err);
      })
    );
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.auth.refreshToken().pipe(
        switchMap((res: any) => {
          this.isRefreshing = false;
          const newToken = this.auth.getToken();
          this.refreshTokenSubject.next(newToken ?? null);
          return next.handle(this.addToken(req, newToken ?? null));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.toast.error('No se pudo refrescar la sesión.');
          this.auth.logout();
          this.router.navigate(['/login']);
          return throwError(() => err);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap((token) => next.handle(this.addToken(req, token)))
      );
    }
  }
}
