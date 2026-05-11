import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertasStateService } from '../../core/services/alertas-state.service';
import { AlertaVenta } from '../../pages/asesor/alerta/alerta';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {
  nombres = '';
  rol = '';
  alertas: AlertaVenta[] = [];
  showNotif = false;
  private sub!: Subscription;

  constructor(
    private auth: AuthService,
    private alertasState: AlertasStateService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.nombres = this.auth.nombre;
    this.rol = this.auth.rol ?? '';

    // Solo se suscribe, el polling lo maneja el service
    this.sub = this.alertasState.alertas$.subscribe(data => {
      this.alertas = data;
      this.cdr.detectChanges();
    });
    
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe(); // solo unsub, no clearInterval
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.navbar__notif-wrap')) {
      this.showNotif = false;
    }
  }

  toggleNotif(event: MouseEvent): void {
    event.stopPropagation();
    this.showNotif = !this.showNotif;
  }

  irAAlertas(): void {
    this.showNotif = false;
    this.router.navigate(['asesor/alertas']);
  }

  logout(): void { this.auth.logout(); }

  get iniciales(): string {
    return this.nombres.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  get rolDisplay(): string {
    return this.rolLabel[this.rol] ?? this.rol;
  }

  rolLabel: Record<string, string> = {
    GERENTE: 'Gerente',
    SUPERVISOR: 'Supervisor',
    BACK_OFFICE: 'Back Office',
    AGENTE: 'Asesor'
  };
}