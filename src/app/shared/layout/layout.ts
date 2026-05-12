import { Component, OnInit } from '@angular/core';
import { Navbar } from "../navbar/navbar";
import { NavItem, Sidebar } from "../sidebar/sidebar";
import { RouterModule } from "@angular/router";
import { AuthService } from '../../core/services/auth.service';
const ICONS = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>`,
  ventas:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>`,
  nueva:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
  seguimien: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  alertas:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
};
 
const MENUS: Record<string, NavItem[]> = {
  AGENTE: [
    { label: 'Dashboard',      route: '/asesor/dashboard',    icon: ICONS.dashboard },
    { label: 'Mis Ventas',     route: '/asesor/ventas',       icon: ICONS.ventas    },
    { label: 'Clientes',       route: '/asesor/clientes',  icon: ICONS.nueva     },
    { label: 'Seguimiento',    route: '/asesor/seguimiento',  icon: ICONS.seguimien },
    { label: 'Alertas',        route: '/asesor/alertas',      icon: ICONS.alertas   },
    { label: 'Reporte',        route: '/asesor/generar-reporte',      icon: ICONS.alertas   },
  ],
  SUPERVISOR: [
    { label: 'Dashboard',      route: '/supervisor/dashboard', icon: ICONS.dashboard },
    { label: 'Mi Equipo',      route: '/supervisor/asignar-objetivo',    icon: ICONS.ventas    },
    { label: 'Ventas',         route: '/supervisor/ventas',    icon: ICONS.seguimien },
    { label: 'Alertas',        route: '/supervisor/alertas',   icon: ICONS.alertas   },
  ],
  GERENTE: [
    { label: 'Dashboard',      route: '/gerente/dashboard',    icon: ICONS.dashboard },
    { label: 'Asignar Supervisor',         route: '/gerente/asignar-supervisor',       icon: ICONS.ventas    },
    { label: 'Crear Campaña',       route: '/gerente/crear-campana',     icon: ICONS.nueva     },
    { label: 'Ver ventas',  route: '/gerente/ver-ventas-general',       icon: ICONS.alertas   },
    { label: 'Gestion de Usuarios',  route: '/gerente/gestion-usuarios',       icon: ICONS.alertas   },
  ],
  BACK_OFFICE: [
    { label: 'Dashboard',      route: '/backoffice/dashboard', icon: ICONS.dashboard },
    { label: 'Ventas',         route: '/backoffice/ventas',    icon: ICONS.ventas    },
    { label: 'Estados',        route: '/backoffice/estados',   icon: ICONS.seguimien },
    { label: 'Alertas',        route: '/backoffice/alertas',   icon: ICONS.alertas   },
  ],
};

@Component({
  selector: 'app-layout',
  imports: [Navbar, Sidebar, RouterModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit {
  
  menuItems: NavItem[] = [];
 
  constructor(private auth: AuthService) {}
 
  ngOnInit(): void {
    const rol = this.auth.rol ?? 'AGENTE';
    this.menuItems = MENUS[rol] ?? MENUS['AGENTE'];
  }
}
