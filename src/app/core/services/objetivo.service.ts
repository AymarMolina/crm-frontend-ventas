import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AgenteEquipo {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  nombreSupervisor: string;
}

export interface CrearObjetivoRequest {
  campanaId: string;
  usuarioId: string;
  objetivoVentas: number;
  montoComision: number;
}

export interface ObjetivoResponse {
  id: number;
  campanaId: string;
  campanaNombre: string;
  usuarioId: string;
  usuarioNombre: string;
  objetivoVentas: number;
  montoComision: number;
  creadoEn: string;
  ventasActivas?: number; // <-- agregar esto
}

@Injectable({ providedIn: 'root' })
export class ObjetivoService {
  private readonly API  = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}
  // En tu archivo objetivo.service.ts
  getUsuario(id: string): Observable<any> {
    return this.http.get<any>(`${this.API}/${id}`);
  }
  getMiEquipo(): Observable<AgenteEquipo[]> {
    return this.http.get<AgenteEquipo[]>(`${this.API}/usuarios/mi-equipo`);
  }

  crearObjetivo(req: CrearObjetivoRequest): Observable<ObjetivoResponse> {
    return this.http.post<ObjetivoResponse>(`${this.API}/objetivos`, req);
  }
  buscarObjetivo(usuarioId: string, campanaId: string): Observable<ObjetivoResponse | null> {
    return this.http.get<ObjetivoResponse>(
      `${this.API}/objetivos/buscar`,
      { params: { usuarioId, campanaId } }
    ).pipe(
      catchError(err => {
        if (err.status === 204) return of(null); // no existe
        return throwError(() => err);
      })
    );
  }
  getSupervisores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/usuarios/supervisores`);
  }
  actualizarObjetivo(id: number, data: CrearObjetivoRequest): Observable<ObjetivoResponse> {
    return this.http.put<ObjetivoResponse>(
      `${this.API}/objetivos/${id}`, data
    );
  }
  
  getMisObjetivos(): Observable<ObjetivoResponse[]> {
    return this.http.get<ObjetivoResponse[]>(`${this.API}/objetivos/mis-objetivos`);
  }

  getObjetivosPorUsuario(usuarioId: string): Observable<ObjetivoResponse[]> {
    return this.http.get<ObjetivoResponse[]>(
      `${this.API}/objetivos/por-usuario/${usuarioId}`
    );
  }
 
}