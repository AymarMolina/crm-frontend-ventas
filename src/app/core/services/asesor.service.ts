import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Asesor {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  nombreSupervisor: string;
}

@Injectable({ providedIn: 'root' })
export class AsesorService {
    
  private base = `${environment.apiUrl}/api/usuarios`;

  constructor(private http: HttpClient) {}

  listarAsesores(): Observable<Asesor[]> {
    return this.http.get<Asesor[]>(`${this.base}/asesores`);
  }
}