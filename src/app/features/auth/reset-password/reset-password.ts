import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword implements OnInit {
  form: FormGroup;
  token        = '';
  loading      = false;
  errorMsg     = '';
  exito        = false;
  tokenInvalido = false;
  showPass     = false;
  showConfirm  = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      newPassword:     ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatch });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) this.tokenInvalido = true;
  }

  get newPassword()     { return this.form.get('newPassword')!; }
  get confirmPassword() { return this.form.get('confirmPassword')!; }

  passwordsMatch(group: FormGroup) {
    const a = group.get('newPassword')?.value;
    const b = group.get('confirmPassword')?.value;
    return a === b ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.form.invalid || !this.token) return;
    this.loading  = true;
    this.errorMsg = '';

    this.authService.resetPassword(this.token, this.newPassword.value).subscribe({
      next: () => {
        this.loading = false;
        this.exito   = true;
        setTimeout(() => this.router.navigateByUrl('/login'), 2500);
      },
      error: err => {
        this.loading  = false;
        const msg = err.error?.message ?? '';
        if (msg.toLowerCase().includes('expir') || msg.toLowerCase().includes('inválid')) {
          this.tokenInvalido = true;
        } else {
          this.errorMsg = msg || 'Error al cambiar la contraseña';
        }
      }
    });
  }

  irAForgot(): void {
    this.router.navigateByUrl('/forgot-password');
  }
}