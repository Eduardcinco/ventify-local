import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Cliente {
  id: number;
  negocioId: number;
  nombreCompleto: string;
  telefono: string;
  correo?: string;
  direccion?: string;
  rfc?: string;
  limiteCredito: number;
  saldoActual: number;
  notas?: string;
  activo: boolean;
  fechaCreacion: string;
}

export interface CrearClienteDTO {
  nombreCompleto: string;
  telefono: string;
  correo?: string;
  direccion?: string;
  rfc?: string;
  limiteCredito: number;
  notas?: string;
}

export interface ActualizarClienteDTO {
  nombreCompleto?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  rfc?: string;
  limiteCredito?: number;
  notas?: string;
  activo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private apiUrl = `${environment.apiUrl}/api/clientes`;

  constructor(private http: HttpClient) {}

  getClientes(soloActivos: boolean = true): Observable<Cliente[]> {
    const params = new HttpParams().set('soloActivos', soloActivos.toString());
    return this.http.get<Cliente[]>(this.apiUrl, { params });
  }

  getClienteById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  createCliente(dto: CrearClienteDTO): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, dto);
  }

  updateCliente(id: number, dto: ActualizarClienteDTO): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, dto);
  }

  deleteCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
