    import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/crm.models';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private base = `${environment.apiUrl}/api/auth`;
  

  constructor(private http: HttpClient,private router: Router) {}

  login(body: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/login`, body).pipe(
      tap(res => {
        localStorage.setItem('token', res.accessToken);
        localStorage.setItem('rol', res.rol);
        localStorage.setItem('nombres', res.nombres);
      })
    );
  }
  obtenerUsuarioId(): string | null {
    const token = localStorage.getItem('token'); // O donde guardes tu "autorization"
    if (!token) return null;

    try {
      
      const decoded: any = jwtDecode(token);
      return decoded.sub; // Aquí sacamos el ID del agente
    } catch (error) {
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('nombres');

    this.router.navigate(['/login']).then(() => {
    // 3. Recargamos la ventana para limpiar estados de memoria/servicios
    window.location.reload();
  });
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRol(): string | null {
    return localStorage.getItem('rol');
  }
  get nombre(): string {
    return localStorage.getItem('nombres') ?? 'Usuario';
  }

  get rol(): string {
    return localStorage.getItem('rol') ?? '';
  }
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.base}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.base}/reset-password`, { token, newPassword });
  }
  checkEmail(email: string): Observable<{ existe: boolean }> {
    return this.http.get<{ existe: boolean }>(
      `${this.base}/check-email`, 
      { params: { email } }
    );
  }
}