import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = 'http://localhost:8080/api/ventas';

  constructor(private http: HttpClient) {}

  getDashboardData(periodo: string = '15d'): Observable<any> {
    const params = new HttpParams().set('periodo', periodo);

    return forkJoin({
      resumen: this.http.get(`${this.API_URL}/resumen`, { params }),
      tendencia: this.http.get<any[]>(`${this.API_URL}/tendencia`, { params }),
      porCampana: this.http.get<any[]>(`${this.API_URL}/por-campana`, { params }),
      porEstado: this.http.get<any[]>(`${this.API_URL}/por-estado`, { params }),
      alertas: this.http.get<any[]>(`${this.API_URL}/alertas`)
    });
  }
}