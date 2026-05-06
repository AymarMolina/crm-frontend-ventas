// src/app/core/services/productos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/crm.models';


@Injectable({ providedIn: 'root' })
export class ProductosService {
  private base = 'http://localhost:8080/api/campanas';

  constructor(private http: HttpClient) {}

  listarPorCampana(campanaId: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.base}/${campanaId}/productos`);
  }
}