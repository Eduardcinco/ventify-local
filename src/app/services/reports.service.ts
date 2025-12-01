// NUEVO ARCHIVO: Crear servicio para reportes
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BusinessContextService } from './business-context.service';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private base = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient, private biz: BusinessContextService) {}

  private buildHeaders(): { headers?: HttpHeaders } {
    const negocioId = this.biz.getNegocioId();
    if (this.biz.shouldSendDebugHeader() && negocioId) {
      return { headers: new HttpHeaders({ 'X-Debug-Negocio': String(negocioId) }) };
    }
    return {};
  }

  // Reportes de ventas
  getVentasPorDia(desde?: string, hasta?: string): Observable<any[]> {
    let params = '';
    if (desde || hasta) {
      params = `?${desde ? `desde=${desde}` : ''}${hasta ? `&hasta=${hasta}` : ''}`;
    }
    return this.http.get<any[]>(`${this.base}/reportes/ventas/dia${params}`, this.buildHeaders());
  }

  getVentasPorSemana(desde?: string, hasta?: string): Observable<any[]> {
    let params = '';
    if (desde || hasta) {
      params = `?${desde ? `desde=${desde}` : ''}${hasta ? `&hasta=${hasta}` : ''}`;
    }
    return this.http.get<any[]>(`${this.base}/reportes/ventas/semana${params}`, this.buildHeaders());
  }

  getVentasPorMes(anio: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/reportes/ventas/mes?anio=${anio}` , this.buildHeaders());
  }

  getVentasPorAnio(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/reportes/ventas/anio`, this.buildHeaders());
  }

  // Reportes de inventario
  getInventario(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/reportes/inventario`, this.buildHeaders());
  }

  getInventarioPorCategoria(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/reportes/inventario/categoria`, this.buildHeaders());
  }

  getInventarioStockBajo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/reportes/inventario/stock-bajo`, this.buildHeaders());
  }

  // PDFs
  downloadVentaPdf(ventaId: number): Observable<Blob> {
    return this.http.get(`${this.base}/ventas/${ventaId}/pdf`, { responseType: 'blob', ...this.buildHeaders() });
  }

  downloadInventarioPdf(categoria?: string, stockBajo?: boolean): Observable<Blob> {
    let params = '';
    if (categoria || stockBajo) {
      params = `?${categoria ? `categoria=${categoria}` : ''}${stockBajo ? `&stockBajo=${stockBajo}` : ''}`;
    }
    return this.http.get(`${this.base}/producto/inventario-pdf${params}`, { responseType: 'blob', ...this.buildHeaders() });
  }
}