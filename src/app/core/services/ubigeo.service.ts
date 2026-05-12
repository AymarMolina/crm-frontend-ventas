import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

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
  private base = `${environment.apiUbi}api/Ubigeo`;

  constructor(private http: HttpClient) {}

  listarDepartamentos(): Observable<Departamento[]> {
    return this.http.get<Departamento[]>(`${this.base}/ListarDepartamentoProyecto`);
  }

  listarProvincias(departamento: string): Observable<Provincia[]> {
    return this.http.get<Provincia[]>(`${this.base}/ListarProvinciaProyecto`, {
      params: { Departamento: departamento }
    });
  }

  listarDistritos(departamento: string, provincia: string): Observable<Distrito[]> {
    return this.http.get<Distrito[]>(`${this.base}/ListarDistritoProyecto`, {
      params: { Departamento: departamento, Provincia: provincia }
    });
  }
}