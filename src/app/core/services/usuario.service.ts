import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type RolCodigo = 'GERENTE' | 'SUPERVISOR' | 'BACK_OFFICE' | 'AGENTE';

export interface CrearUsuarioRequest {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  rolCodigo: RolCodigo;
}

export interface ActualizarUsuarioRequest {
  nombres: string;
  apellidos: string;
  email: string;
  rolCodigo: RolCodigo;
}

export interface UsuarioResponse {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  rolCodigo: RolCodigo;
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private base = `${environment.apiUrl}/api/usuarios`;

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<UsuarioResponse[]> {
    return this.http.get<UsuarioResponse[]>(this.base);
  }

  getUsuario(id: string): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.base}/${id}`);
  }

  crearUsuario(payload: CrearUsuarioRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(this.base, payload);
  }

  actualizarUsuario(id: string, payload: ActualizarUsuarioRequest): Observable<UsuarioResponse> {
    return this.http.put<UsuarioResponse>(`${this.base}/${id}`, payload);
  }

  eliminarUsuario(id: string): Observable<any> {
      return this.http.delete(`${this.base}/${id}`);
  }

  toggleActivo(id: string, activo: boolean): Observable<UsuarioResponse> {
    return this.http.patch<UsuarioResponse>(`${this.base}/${id}/activo`, { activo });
  }
  getUsuariosEliminados(): Observable<any[]> {
      return this.http.get<any[]>(`${this.base}/eliminados`);
  }

  reactivarUsuario(id: string): Observable<any> {
      return this.http.patch(`${this.base}/${id}/reactivar`, {});
  }
}