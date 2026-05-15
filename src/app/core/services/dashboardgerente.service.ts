import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ── Modelos ──────────────────────────────────────────────────────────────────

export interface CampanaSelectorResponse {
  id: string;
  nombre: string;
  lineaNombre: string;
  mes: number;
  anio: number;
}

export interface CampanaResponse {
  id: string;
  nombre: string;
  lineaNombre: string;
  mes: number;
  anio: number;
  objetivoTotal: number;
  activo: boolean;
}

export interface AgenteRendimientoResponse {
  agenteId: string;
  nombreCompleto: string;
  supervisorNombre: string;
  ventasActivas: number;
  objetivoVentas: number;
  pctAlcance: number;
  comisionEstimada: number;
  montoComisionMax: number;
  caidas: number;
  alertas: number;
}

export interface AlertaResponse {
  ventaId: string;
  codigoVenta: string;
  alertaDetalle: string | null;
  estadoNombre: string;
  agenteNombre: string;
  actualizadoEn: string;
}

export interface DashboardGerenteResponse {
  campana: CampanaResponse;
  ventasActivas: number;
  objetivoCampana: number;
  pctAlcance: number;
  agentesActivos: number;
  agentesTotal: number;
  alertasActivas: number;
  caidas: number;
  tasaCaida: number;
  comisionEstimada: number;
  distribucionEstados: Record<string, number>;
  agentes: AgenteRendimientoResponse[];
  alertasRecientes: AlertaResponse[];
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class DashboardGerenteService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/dashboard/gerente`;

  getCampanas(): Observable<CampanaSelectorResponse[]> {
    return this.http.get<CampanaSelectorResponse[]>(`${this.base}/campanas`);
  }

  getDashboard(campanaId: string): Observable<DashboardGerenteResponse> {
    return this.http.get<DashboardGerenteResponse>(`${this.base}/${campanaId}`);
  }
}