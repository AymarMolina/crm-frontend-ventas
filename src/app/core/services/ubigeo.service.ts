import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Departamento {
  departamento: string;
}

export interface Provincia {
  provincia: string;
}

export interface Distrito {
  distrito: string;
}

@Injectable({ providedIn: 'root' })
export class UbigeoService {
  // Cambiamos la base para que use el prefijo del proxy/rewrite
  private base = '/api-pronis/api/Ubigeo';

  constructor(private http: HttpClient) {}

  listarDepartamentos(): Observable<Departamento[]> {
    // Usamos la variable 'base' para mantener el orden
    return this.http.get<Departamento[]>(`${this.base}/ListarDepartamentoProyecto`)
      .pipe(
        tap(response => console.log('¡Departamentos recibidos sin CORS!:', response))
      );
  }

  listarProvincias(departamento: string): Observable<Provincia[]> {
    return this.http.get<Provincia[]>(`${this.base}/ListarProvinciaProyecto`, {
      params: { Departamento: departamento }
    }).pipe(
      tap(response => console.log('¡Provincias recibidas sin CORS!:', response))
    );
  }

  listarDistritos(departamento: string, provincia: string): Observable<Distrito[]> {
    return this.http.get<Distrito[]>(`${this.base}/ListarDistritoProyecto`, {
      params: { Departamento: departamento, Provincia: provincia }
    }).pipe(
      tap(response => console.log('¡Distritos recibidos sin CORS!:', response))
    );
  }
}