import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  errorMsg = '';
  showPass = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get email()    { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.errorMsg = '';

    this.authService.login(this.form.value).subscribe({
      next: () => {
        const rol = this.authService.getRol();
        switch (rol) {
          case 'SUPERVISOR':  this.router.navigate(['/supervisor']); break;
          case 'AGENTE':      this.router.navigate(['/asesor']); break;
          case 'GERENTE':     this.router.navigate(['/gerente']); break;
          case 'BACK_OFFICE': this.router.navigate(['/backoffice']); break;
          default:
            this.loading = false;
            this.errorMsg = 'Rol no reconocido';
            this.cdr.detectChanges(); // ← forzar
            break;
        }
      },
      error: (err) => {
        this.loading = false;  // ← esto ya estaba
        
        const status = err.status;
        const mensaje = err.error?.message;

        if (status === 423) {
          this.errorMsg = 'Cuenta bloqueada. Intenta en 15 minutos.';
        } else if (status === 400 || status === 401) {
          this.errorMsg = mensaje ?? 'Credenciales inválidas';
        } else if (status === 0) {
          this.errorMsg = 'No se pudo conectar con el servidor';
        } else {
          this.errorMsg = 'Error inesperado. Intenta nuevamente';
        }

        this.cdr.detectChanges(); // ← ESTE es el fix principal
      }
    });
  }
  irAForgot(): void {
    this.router.navigateByUrl('/forgot-password');
  }
}