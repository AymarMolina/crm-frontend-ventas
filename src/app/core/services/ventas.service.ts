import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CambioEstadoRequest, PageResponse, Venta, VentaRequest } from '../models/crm.models';
import { environment } from '../../../environments/environment';
import { AlertaVenta } from '../../pages/asesor/alerta/alerta';
import { HistorialEstado } from '../../pages/asesor/ventas/ventas';

export interface VentasFiltros {
  campanaId?: string;
  agenteId?: string;
  estadoCodigo?: string;
  tieneAlerta?: boolean;
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class VentasService {
  private base = `${environment.apiUrl}/api/ventas`;

  constructor(private http: HttpClient) {}

  listar(filtros: VentasFiltros = {}): Observable<PageResponse<Venta>> {
    let params = new HttpParams()
      .set('page', filtros.page ?? 0)
      .set('size', filtros.size ?? 20);
    if (filtros.campanaId)   params = params.set('campanaId', filtros.campanaId);
    if (filtros.agenteId)    params = params.set('agenteId', filtros.agenteId);
    if (filtros.estadoCodigo) params = params.set('estadoCodigo', filtros.estadoCodigo);
    if (filtros.tieneAlerta !== undefined)
      params = params.set('tieneAlerta', String(filtros.tieneAlerta));
    return this.http.get<PageResponse<Venta>>(this.base, { params });
  }

  obtenerPorId(id: string): Observable<Venta> {
    return this.http.get<Venta>(`${this.base}/${id}`);
  }

  ventasPorCliente(clienteId: string): Observable<PageResponse<Venta>> {
    return this.http.get<PageResponse<Venta>>(`${this.base}/cliente/${clienteId}`);
  }

  crear(body: VentaRequest): Observable<Venta> {
    return this.http.post<Venta>(this.base, body);
  }

  vincularCliente(ventaId: string, clienteId: string): Observable<Venta> {
    return this.http.patch<Venta>(`${this.base}/${ventaId}/cliente/${clienteId}`, {});
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
  ventasdeAgente(agenteId: string, page = 0, size = 20): Observable<PageResponse<Venta>> {
    const params = new HttpParams()
      .set('agenteId', agenteId)
      .set('page', page)
      .set('size', size);

    return this.http.get<PageResponse<Venta>>(this.base, { params });
  }
  // POST http://localhost:8080/api/ventas
  guardarVenta(venta: any): Observable<Venta> {
    return this.http.post<Venta>(this.base, venta);
  }
  
  // Tu método anterior para el dashboard
  ventasPorAgente(agenteId: string, page: number, size: number): Observable<any> {
    return this.http.get(`${this.base}/agente/${agenteId}?page=${page}&size=${size}`);
  }

  getAlertas(): Observable<AlertaVenta[]> {
    return this.http.get<AlertaVenta[]>(`${this.base}/alertas`);
  }

  cambiarEstado(id: string, body: { estadoCodigo: string; motivo: string }): Observable<any> {
    return this.http.patch(`${this.base}/${id}/estado`, body);
  }
  archivarCaida(id: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/archivar-caida`, {});
  }
  getHistorial(ventaId: string): Observable<HistorialEstado[]> {
    return this.http.get<HistorialEstado[]>(`${this.base}/${ventaId}/historial`);
  }
}