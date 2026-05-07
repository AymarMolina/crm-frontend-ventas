import { Component } from '@angular/core';
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
    private router: Router
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
        // Obtenemos el rol después del login
        const rol = this.authService.getRol();

        // Redirección basada en el rol
        switch (rol) {
          case 'SUPERVISOR':
            this.router.navigate(['/supervisor']);
            break;
          case 'AGENTE':
            this.router.navigate(['/asesor']);
            break;
          case 'GERENTE':
            this.router.navigate(['/gerente']);
            break;
          case 'BACK_OFFICE':
            this.router.navigate(['/backoffice']);
            break;
          default:
            this.router.navigate(['/']); // O una página por defecto
            break;
        }
      },
      error: err => {
        this.loading = false;
        this.errorMsg = err.error?.message ?? 'Error al conectar con el servidor';
      }
    });
  }
  irAForgot(): void {
    this.router.navigateByUrl('/forgot-password');
  }
}