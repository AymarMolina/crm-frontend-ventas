import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FiltroReporte {
  fechaDesde: string;   // 'YYYY-MM-DD'
  fechaHasta: string;
  campanaId?: string;
  campanaNombre?: string;
  supervisorId?: string; // solo gerente
}

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private base = `${environment.apiUrl}/api/reportes/ventas`;

  constructor(private http: HttpClient) {}

  // ── ASESOR ──────────────────────────────────────────────────────────────────
  descargarReporteAsesor(filtro: FiltroReporte): Observable<Blob> {
    const params = this.buildParams(filtro);
    return this.http.get(`${this.base}/asesor`, {
      params,
      responseType: 'blob',
    });
  }

  // ── SUPERVISOR ──────────────────────────────────────────────────────────────
  descargarReporteSupervisor(filtro: FiltroReporte): Observable<Blob> {
    const params = this.buildParams(filtro);
    return this.http.get(`${this.base}/supervisor`, {
      params,
      responseType: 'blob',
    });
  }

  // ── GERENTE ─────────────────────────────────────────────────────────────────
  descargarReporteGerente(filtro: FiltroReporte): Observable<Blob> {
    const params = this.buildParams(filtro);
    return this.http.get(`${this.base}/gerente`, {
      params,
      responseType: 'blob',
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  private buildParams(filtro: FiltroReporte): HttpParams {
    let params = new HttpParams()
      .set('fechaDesde', filtro.fechaDesde)
      .set('fechaHasta', filtro.fechaHasta);

    if (filtro.campanaId)    params = params.set('campanaId', filtro.campanaId);
    if (filtro.campanaNombre) params = params.set('campanaNombre', filtro.campanaNombre);
    if (filtro.supervisorId) params = params.set('supervisorId', filtro.supervisorId);

    return params;
  }

  /** Dispara la descarga del blob como archivo .xlsx en el navegador */
  triggerDescarga(blob: Blob, nombreArchivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = nombreArchivo;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}