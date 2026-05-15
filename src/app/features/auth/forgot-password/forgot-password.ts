import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword implements OnDestroy {
  form: FormGroup;
  loading  = false;
  errorMsg = '';
  enviado  = false;
  // Variables para la animación del mouse en el panel izquierdo
  mouseX = -150;
  mouseY = -150;
  private timer: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef   // ← agrega esto
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() { return this.form.get('email')!; }
  onMouseMove(event: MouseEvent) {
    this.mouseX = event.clientX - 150;
    this.mouseY = event.clientY - 150;
  }
  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading  = true;
    this.errorMsg = '';

    // Primero verifica si el email existe
    this.authService.checkEmail(this.email.value).subscribe({
      next: ({ existe }) => {
        if (!existe) {
          this.loading  = false;
          this.errorMsg = 'No encontramos una cuenta con ese correo.';
          this.cdr.detectChanges();
          return;
        }

        // Si existe, envía el reset
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.loading = false;
          this.enviado = true;
          this.cdr.detectChanges();
        }, 4000);

        this.authService.forgotPassword(this.email.value).subscribe({
          next: () => {
            clearTimeout(this.timer);
            this.loading = false;
            this.enviado = true;
            this.cdr.detectChanges();
          },
          error: () => {
            clearTimeout(this.timer);
            this.loading = false;
            this.enviado = true;
            this.cdr.detectChanges();
          }
        });
      },
      error: () => {
        this.loading  = false;
        this.errorMsg = 'Error al verificar el correo.';
        this.cdr.detectChanges();
      }
    });
  }

  backToLogin(): void {
    this.router.navigateByUrl('/login');
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }
}