import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { VentasService } from '../../core/services/ventas.service';
import { Venta } from '../../core/models/crm.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  nombres = '';
  rol = '';
  rolLabel: Record<string, string> = {
    GERENTE: 'Gerente',
    SUPERVISOR: 'Supervisor',
    BACK_OFFICE: 'Back Office',
    AGENTE: 'Asesor'
  };
 
  alertas: Venta[] = [];
  showNotif = false;
 
  constructor(private auth: AuthService, private ventasSvc: VentasService) {}
 
  ngOnInit(): void {
    this.nombres = this.auth.nombre;
    this.rol = this.auth.rol ?? '';

    this.ventasSvc.listar({ page: 0, size: 5 }).subscribe(res => {
      this.alertas = res.content.filter(v => v.tieneAlerta);
    });
  }
 
  toggleNotif(): void {
    this.showNotif = !this.showNotif;
  }
 
  logout(): void {
    this.auth.logout();
  }
 
  get iniciales(): string {
    return this.nombres.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }
 
  get rolDisplay(): string {
    return this.rolLabel[this.rol] ?? this.rol;
  }
}