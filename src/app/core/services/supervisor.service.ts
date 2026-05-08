import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Supervisor {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  nombreSupervisor: string;
}

@Injectable({ providedIn: 'root' })
export class SupervisorService {
  private base = `${environment.apiUrl}/api/usuarios`;

  constructor(private http: HttpClient) {}

  listarSupervisores(): Observable<Supervisor[]> {
    return this.http.get<Supervisor[]>(`${this.base}/supervisores`);
  }
}