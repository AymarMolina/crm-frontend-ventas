import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DesignarSupervisorRequest {
  agenteId: string;
  supervisorId: string;
}

export interface CrearCampanaRequest {
  nombre: string;
  lineaId: number;
  mes: number;
  anio: number;
  objetivoTotal: number;
}

export interface CampanaResponse {
  id: string;
  nombre: string;
  linea: string;
  lineaCodigo: string;
  mes: number;
  anio: number;
  objetivoTotal: number;
  activo: boolean;
}

export interface LineaProducto {
  id: number;
  codigo: string;
  nombre: string;
}
export interface CrearProductoRequest {
  nombre: string;
  descripcion: string;
  precio: number;
}

@Injectable({ providedIn: 'root' })
export class GerenteService {
  private base      = `${environment.apiUrl}/api/usuarios`;
  private campanasBase = `${environment.apiUrl}/api/campanas`;
  private lineasBase   = `${environment.apiUrl}/api/lineas`;

  constructor(private http: HttpClient) {}

  designarSupervisor(payload: DesignarSupervisorRequest): Observable<void> {
    return this.http.patch<void>(`${this.base}/designar-supervisor`, payload);
  }

  crearCampana(payload: CrearCampanaRequest): Observable<CampanaResponse> {
    return this.http.post<CampanaResponse>(this.campanasBase, payload);
  }

  getLineas(): Observable<LineaProducto[]> {
    return this.http.get<LineaProducto[]>(this.lineasBase);
  }
  crearProducto(campanaId: string, payload: CrearProductoRequest): Observable<any> {
    return this.http.post(`${this.campanasBase}/${campanaId}/productos`, payload);
  }
}
