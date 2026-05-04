import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f5f5f5;">
      <div style="text-align:center;padding:40px;">
        <p style="font-size:4rem;margin:0">🔒</p>
        <h1 style="font-family:'DM Sans',sans-serif;font-size:1.4rem;font-weight:700;color:#111827;margin:12px 0 8px">Acceso no autorizado</h1>
        <p style="font-size:0.85rem;color:#6b7280;margin:0 0 24px">No tienes permisos para acceder a esta sección.</p>
        <button (click)="volver()" style="padding:10px 24px;background:#2563eb;color:#fff;border:none;border-radius:10px;font-weight:600;cursor:pointer;font-size:0.9rem">Volver al inicio</button>
      </div>
    </div>
  `
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}
  volver() { this.router.navigate(['/']); }
}