import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente, ClienteRequest, PageResponse } from '../models/crm.models';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private base = 'http://localhost:8080/api/clientes';

  constructor(private http: HttpClient) {}

  listar(q?: string, page = 0, size = 20, sort = 'apellidos'): Observable<PageResponse<Cliente>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);
    if (q) params = params.set('q', q);
    return this.http.get<PageResponse<Cliente>>(this.base, { params });
  }

  obtenerPorId(id: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.base}/${id}`);
  }

  crear(body: ClienteRequest): Observable<Cliente> {
    return this.http.post<Cliente>(this.base, body);
  }

  actualizar(id: string, body: ClienteRequest): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.base}/${id}`, body);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
  // GET http://localhost:8080/api/clientes/buscar?tipoDoc=DNI&nroDoc=12345678
  buscarPorDocumento(tipoDoc: string, nroDoc: string): Observable<Cliente> {
    const params = new HttpParams()
      .set('tipoDoc', tipoDoc)
      .set('nroDoc', nroDoc);
    
    return this.http.get<Cliente>(`${this.base}/buscar`, { params });
  }

  // Para cuando es cliente nuevo, necesitaremos un POST aquí más adelante
  crearCliente(cliente: Partial<Cliente>): Observable<Cliente> {
    return this.http.post<Cliente>(this.base, cliente);
  }

}