import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Campana, PageResponse } from '../models/crm.models';
import { environment } from '../../../environments/environment';

export interface CampanasFiltros {
  lineaCodigo?: 'MIGRACIONES' | 'MOVIL' | 'INTERNET';
  mes?: number;
  anio?: number;
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class CampanasService {

  private base = `${environment.apiUrl}/api/campanas`;
  

  constructor(private http: HttpClient) {}

  listar(filtros: CampanasFiltros = {}): Observable<PageResponse<Campana>> {
    let params = new HttpParams()
      .set('page', (filtros.page ?? 0).toString())
      .set('size', (filtros.size ?? 20).toString());

    if (filtros.lineaCodigo) {
      params = params.set('lineaCodigo', filtros.lineaCodigo);
    }
    
    if (filtros.mes !== undefined && filtros.mes !== null) {
      params = params.set('mes', filtros.mes.toString());
    }
    
    if (filtros.anio !== undefined && filtros.anio !== null) {
      params = params.set('anio', filtros.anio.toString());
    }

    return this.http.get<PageResponse<Campana>>(this.base, { params });
  }
  listarCampanas(): Observable<Campana[]> {
    return this.http.get<PageResponse<Campana>>(this.base).pipe(
      map(response => response.content)
    );
  }

  obtenerPorId(id: string): Observable<Campana> {
    return this.http.get<Campana>(`${this.base}/${id}`);
  }

}