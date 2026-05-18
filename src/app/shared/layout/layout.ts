import { Component, OnInit } from '@angular/core';
import { Navbar } from "../navbar/navbar";
import { NavItem, Sidebar } from "../sidebar/sidebar";
import { RouterModule } from "@angular/router";
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
const ICONS = {
  dashboard: `<i class='bx bxs-dashboard'></i>`,
  ventas:    `<i class='bx bx-receipt'></i>`,
  clientes:  `<i class='bx bx-group'></i>`,
  seguimien: `<i class='bx bx-line-chart'></i>`,
  alertas:   `<i class='bx bx-bell'></i>`,
  objetivo:  `<i class='bx bx-target-lock'></i>`,
  equipo:    `<i class='bx bx-user-check'></i>`,
  campana:   `<i class='bx bx-bookmark alt'></i>`,
  usuarios:  `<i class='bx bx-cog'></i>`,
  estados:   `<i class='bx bx-transfer'></i>`,
  reporte:   `<i class='bx bx-bar-chart-alt-2'></i>`,
  supervisor:`<i class='bx bx-user-pin'></i>`,
};

const MENUS: Record<string, NavItem[]> = {
  AGENTE: [
    { label: 'Dashboard',   route: '/asesor/dashboard',       icon: ICONS.dashboard },
    { label: 'Mis Ventas',  route: '/asesor/ventas',          icon: ICONS.ventas    },
    { label: 'Clientes',    route: '/asesor/clientes',        icon: ICONS.clientes  },
    { label: 'Seguimiento', route: '/asesor/seguimiento',     icon: ICONS.seguimien },
    { label: 'Alertas',     route: '/asesor/alertas',         icon: ICONS.alertas   },
    { label: 'Reporte',     route: '/asesor/generar-reporte', icon: ICONS.reporte   },
  ],
  SUPERVISOR: [
    { label: 'Mi Equipo',         route: '/supervisor/supervisor-equipo', icon: ICONS.equipo    },
    { label: 'Panel de equipo',   route: '/supervisor/dashboard',         icon: ICONS.dashboard },
    { label: 'Mis Ventas',        route: '/supervisor/ventas',            icon: ICONS.ventas    },
    { label: 'Asignar Objetivos', route: '/supervisor/asignar-objetivo',  icon: ICONS.objetivo  },
    { label: 'Clientes',          route: '/supervisor/clientes',          icon: ICONS.clientes  },
    { label: 'Reporte',           route: '/supervisor/generar-reporte',   icon: ICONS.reporte   },
  ],
  GERENTE: [
    { label: 'Dashboard',          route: '/gerente/dashboard',         icon: ICONS.dashboard  },
    { label: 'Mis Ventas',         route: '/gerente/ventas',            icon: ICONS.ventas     },
    { label: 'Asignar Supervisor', route: '/gerente/asignar-supervisor',icon: ICONS.supervisor },
    { label: 'Objetivos Supervisor',route: '/gerente/asignar-objetivo', icon: ICONS.supervisor },
    { label: 'Crear Campaña',      route: '/gerente/crear-campana',     icon: ICONS.campana    },
    { label: 'Clientes',           route: '/gerente/clientes',          icon: ICONS.clientes   },
    { label: 'Gestión Usuarios',   route: '/gerente/gestion-usuarios',  icon: ICONS.usuarios   },
    { label: 'Reportes',           route: '/gerente/reporte-asesores',   icon: ICONS.reporte    },
    { label: 'Reporte Supervisor',           route: '/gerente/reporte-supervisor',   icon: ICONS.reporte    },
    
  ],
  BACK_OFFICE: [
    { label: 'Mis Ventas',route: '/backoffice/ventas',          icon: ICONS.ventas    },
    { label: 'Clientes',  route: '/backoffice/clientes',        icon: ICONS.clientes  },
    { label: 'Estados',   route: '/backoffice/estado-venta',    icon: ICONS.estados   },
    { label: 'Reporte',   route: '/backoffice/generar-reporte', icon: ICONS.reporte   },
  ],
};

@Component({
  selector: 'app-layout',
  imports: [Navbar, Sidebar, RouterModule,CommonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit {
  
  menuItems: NavItem[] = [];
  isSidebarCollapsed = false; // Estado inicial expandido
  constructor(private auth: AuthService) {}
 
  ngOnInit(): void {
    const rol = this.auth.rol ?? 'AGENTE';
    this.menuItems = MENUS[rol] ?? MENUS['AGENTE'];
  }
}
