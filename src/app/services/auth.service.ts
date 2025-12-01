import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  token?: string; // fallback
  primerAcceso?: boolean; // NUEVO: indica si es primer acceso del empleado
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = `${environment.apiUrl}/api/auth`;
  private refreshEndpoint = `${this.base}/refresh`;

  constructor(private http: HttpClient) {}

  private extractToken(res: any): string | undefined {
    if (!res) return undefined;
    return res.accessToken || res.token || (res.data && res.data.accessToken) || undefined;
  }

  private setToken(token?: string) {
    if (token) {
      sessionStorage.setItem('accessToken', token);
    } else {
      sessionStorage.removeItem('accessToken');
    }
  }

  private setRefreshToken(rt?: string) {
    if (rt) {
      sessionStorage.setItem('refreshToken', rt);
    } else {
      sessionStorage.removeItem('refreshToken');
    }
  }

  // Métodos duplicados eliminados. Solo queda una versión de logout, getToken y getRefreshToken.

  login(payload: { email: string; password: string }): Observable<AuthResponse> {
    // Backend expects fields in Spanish: { Correo, Password }
    const body = { Correo: payload.email, Password: payload.password };
    return this.http.post<AuthResponse>(`${this.base}/login`, body).pipe(
      map(res => {
        const token = this.extractToken(res as any);
        if (token) this.setToken(token);
        if ((res as any).refreshToken) this.setRefreshToken((res as any).refreshToken);
        
        // Guardar usuario completo si viene en la respuesta
        if ((res as any).usuario) {
          try { sessionStorage.setItem('usuario', JSON.stringify((res as any).usuario)); } catch {}
        }
        
        // ⭐ Guardar negocioId si viene en la respuesta JSON (además del JWT)
        if ((res as any).usuario?.negocioId) {
          sessionStorage.setItem('negocioId', String((res as any).usuario.negocioId));
        } else if ((res as any).negocioId) {
          sessionStorage.setItem('negocioId', String((res as any).negocioId));
        }
        
        // 🆕 NUEVO: Guardar flag de primer acceso
        if (typeof (res as any).primerAcceso === 'boolean') {
          sessionStorage.setItem('primerAcceso', String((res as any).primerAcceso));
        }
        // Notificar posible cambio de negocioId (BusinessContextService subscribes by calling refresh externally)
        
        return res;
      })
    );
  }

  register(payload: { businessName?: string; name: string; email: string; password: string }) {
    // Backend expects { Nombre, Correo, Password } and may accept NombreNegocio when creating owner
    const body: any = { Nombre: payload.name, Correo: payload.email, Password: payload.password };
    if (payload.businessName && payload.businessName.trim()) {
      body.NombreNegocio = payload.businessName.trim();
    }
    return this.http.post<AuthResponse>(`${this.base}/register`, body).pipe(
      map(res => {
        const token = this.extractToken(res as any);
        if (token) this.setToken(token);
        if ((res as any).refreshToken) this.setRefreshToken((res as any).refreshToken);
        
        // Guardar usuario completo si viene en la respuesta
        if ((res as any).usuario) {
          try { sessionStorage.setItem('usuario', JSON.stringify((res as any).usuario)); } catch {}
        }
        
        // ⭐ Guardar negocioId si viene en la respuesta JSON (nuevo flujo)
        if ((res as any).usuario?.negocioId) {
          sessionStorage.setItem('negocioId', String((res as any).usuario.negocioId));
        } else if ((res as any).negocioId) {
          sessionStorage.setItem('negocioId', String((res as any).negocioId));
        }
        
        // 🆕 NUEVO: Guardar flag de primer acceso
        if (typeof (res as any).primerAcceso === 'boolean') {
          sessionStorage.setItem('primerAcceso', String((res as any).primerAcceso));
        }
        // Notificar posible cambio de negocioId
        
        return res;
      })
    );
  }

  /**
   * Attempt to refresh the access token using the stored refresh token.
   * Returns an Observable that emits the server response containing new tokens.
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return throwError(() => new Error('No refresh token available'));
    return this.http.post<AuthResponse>(this.refreshEndpoint, { refreshToken }).pipe(
      map(res => {
        const token = this.extractToken(res as any);
        if (token) this.setToken(token);
        if ((res as any).refreshToken) this.setRefreshToken((res as any).refreshToken);
        return res;
      })
    );
  }

  logout() {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('negocioId'); // ⭐ Limpiar también negocioId en logout
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('primerAcceso'); // 🆕 NUEVO: Limpiar flag
    // BusinessContextService will see null on refresh
  }

  getToken() {
    return sessionStorage.getItem('accessToken') || undefined;
  }

  getRefreshToken() {
    return sessionStorage.getItem('refreshToken') || undefined;
  }

  /**
   * Allow overriding the refresh endpoint if your API uses a different path.
   */
  setRefreshEndpoint(url: string) {
    this.refreshEndpoint = url;
  }

  // --- Helpers for user context ---
  private decodeTokenRaw(t?: string): any | undefined {
    try {
      const token = t || this.getToken();
      if (!token) return undefined;
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch {
      return undefined;
    }
  }

  getUserId(): number | string | undefined {
    const d = this.decodeTokenRaw();
    // Common JWT claim keys: sub, nameid, userId, uid
    return d?.userId ?? d?.uid ?? d?.nameid ?? d?.sub ?? undefined;
  }

  getBusinessId(): number | string | undefined {
    // ⭐ Priorizar sessionStorage (respuesta JSON login/register) sobre JWT
    const fromSession = sessionStorage.getItem('negocioId');
    if (fromSession) return Number(fromSession) || fromSession;
    
    const d = this.decodeTokenRaw();
    // Backend may include negocioId/tenantId in JWT claims
    return d?.negocioId ?? d?.tenantId ?? undefined;
  }

  getEmployeeId(): number | string | undefined {
    const role = this.getRole();
    // Solo devolver ID de empleado si el rol es "empleado"
    if (role === 'empleado') {
        return this.getUserId();
    }
    return undefined; // Dueños no son empleados
  }

  // AGREGAR método para obtener ID de usuario (dueño o empleado)
  getCurrentUserId(): number | string | undefined {
    return this.getUserId();
  }

  getRole(): string | undefined {
    try {
      const stored = sessionStorage.getItem('usuario');
      if (stored) {
        const u = JSON.parse(stored || '{}');
        const rol = u?.Rol ?? u?.rol;
        if (rol) return String(rol).toLowerCase();
      }
    } catch {}
    const d = this.decodeTokenRaw();
    const fromJwt = d?.rol ?? d?.role ?? d?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    return fromJwt ? String(fromJwt).toLowerCase() : undefined;
  }

  getUserName(): string | undefined {
    const d = this.decodeTokenRaw();
    return d?.name ?? d?.nombre ?? d?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ?? undefined;
  }

  getUserEmail(): string | undefined {
    const d = this.decodeTokenRaw();
    return d?.email ?? d?.correo ?? d?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ?? undefined;
  }

  // Crear empleado (solo dueños)
  createEmployee(payload: { Nombre: string; Apellido1: string; Apellido2?: string | null; Telefono: string; SueldoDiario?: number | null }): Observable<any> {
    return this.http.post<any>(`${this.base}/empleado`, payload);
  }

  // AGREGAR métodos para gestión de perfil
  getUserProfile(): Observable<any> {
    return this.http.get(`${this.base}/perfil`);
  }

  deleteProfilePhoto(): Observable<any> {
    return this.http.delete(`${this.base}/perfil/foto`);
  }

  // Obtener usuario guardado en storage (si existe)
  getCurrentUser(): any | null {
    try {
      const stored = sessionStorage.getItem('usuario');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  }

  // Conveniencia para verificar si es dueño
  isDueno(): boolean {
    const role = (this.getRole() || '').toLowerCase().replace('ñ', 'n');
    return ['dueno', 'owner', 'admin'].some(r => role.includes(r));
  }

  // 🆕 NUEVO: Verificar si es primer acceso
  getPrimerAcceso(): boolean {
    const stored = sessionStorage.getItem('primerAcceso');
    return stored === 'true';
  }

  // 🆕 NUEVO: Cambiar contraseña en primer acceso
  cambiarPasswordPrimerAcceso(nuevaPassword: string): Observable<any> {
    return this.http.put(`${this.base}/primer-acceso`, { NuevaPassword: nuevaPassword }).pipe(
      map(res => {
        // Actualizar flag en sessionStorage
        sessionStorage.setItem('primerAcceso', 'false');
        return res;
      })
    );
  }
}
