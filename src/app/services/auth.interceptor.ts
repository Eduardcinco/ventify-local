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
  private refreshTokenSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private auth: AuthService, private router: Router, private toast: ToastService) {}

  /**
   * 🔐 Añade credenciales para cookies HttpOnly
   * En modo híbrido, también añade Authorization si hay token en storage
   */
  private addCredentials(req: HttpRequest<any>): HttpRequest<any> {
    const token = this.auth.getToken();
    
    // Siempre enviar withCredentials para cookies HttpOnly
    let clonedReq = req.clone({ withCredentials: true });
    
    // Modo híbrido: si hay token en storage, también añadir header Authorization
    if (token) {
      clonedReq = clonedReq.clone({ 
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    
    return clonedReq;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Añadir credenciales (cookies + header híbrido si hay token)
    const authReq = this.addCredentials(req);
    
    return next.handle(authReq).pipe(
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          // Detectar invalidación de versión de token o fallo de auth
          const msg = (err.error?.message || '').toLowerCase();
          const isTokenVersionMismatch = msg.includes('version') || msg.includes('tokenversion');
          const isRefreshEndpoint = req.url.includes('/refresh');
          const isLoginEndpoint = req.url.includes('/login');
          const isRegisterEndpoint = req.url.includes('/register');
          
          // No intentar refresh en endpoints de auth
          if (isTokenVersionMismatch || isRefreshEndpoint || isLoginEndpoint || isRegisterEndpoint) {
            if (!isLoginEndpoint && !isRegisterEndpoint) {
              this.toast.warning('Sesión invalidada. Inicia sesión nuevamente.');
              this.auth.logout().subscribe();
              this.router.navigate(['/login']);
            }
            return throwError(() => err);
          }
          
          // Intentar refresh con cookies HttpOnly
          return this.handle401Error(req, next);
        }
        return throwError(() => err);
      })
    );
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(false);

      // El refresh ahora usa cookies HttpOnly - no necesita token en storage
      return this.auth.refreshToken().pipe(
        switchMap(() => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(true);
          // Reintentar request original con nuevas credenciales
          return next.handle(this.addCredentials(req));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.toast.error('No se pudo refrescar la sesión.');
          this.auth.logout().subscribe();
          this.router.navigate(['/login']);
          return throwError(() => err);
        })
      );
    } else {
      // Esperar a que termine el refresh en curso
      return this.refreshTokenSubject.pipe(
        filter(refreshed => refreshed === true),
        take(1),
        switchMap(() => next.handle(this.addCredentials(req)))
      );
    }
  }
}
