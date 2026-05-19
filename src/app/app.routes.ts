import { Routes } from '@angular/router';
import { Layout } from './shared/layout/layout';
import { authGuard, publicGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ── RUTAS PÚBLICAS (Login y Recuperación) ─────────────────
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent),
    canActivate: [publicGuard]
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password').then(m => m.ForgotPassword),
    canActivate: [publicGuard]
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password').then(m => m.ResetPassword)
    // No lleva publicGuard por si el usuario ya está logueado pero usa un link de reset
  },

  // ── RUTAS PRIVADAS (Con Layout y AuthGuard) ───────────────
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      // ── Módulo ASESOR ──
      {
        path: 'asesor',
        canActivate: [roleGuard(['AGENTE', 'GERENTE'])],
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          {
            path: 'dashboard',
            loadComponent: () => import('./pages/asesor/dashboard/dashboard').then(m => m.Dashboard)
          },
          {
            path: 'ventas',
            loadComponent: () => import('./shared/components/ventas/ventas').then(m => m.Ventas)
          },
          {
            path: 'clientes',
            loadComponent: () => import('./shared/components/clientes/clientes').then(m => m.Clientes)
          },
          {
            path: 'seguimiento',
            loadComponent: () => import('./shared/components/ventas/ventas').then(m => m.Ventas)
          },
          {
            path: 'alertas',
            loadComponent: () => import('./pages/asesor/alerta/alerta').then(m => m.Alerta)
          },
          {
            path: 'reporte-asesores',
            loadComponent: () => import('./shared/components/reporte-asesores/reporte-asesores').then(m => m.ReporteAsesores)
          },
        ]
      },

      // ── Módulo SUPERVISOR ──
      {
        path: 'supervisor',
        canActivate: [roleGuard(['SUPERVISOR', 'GERENTE'])],
        children: [
          { path: '', redirectTo: 'supervisor-equipo', pathMatch: 'full' },
          { 
            path: 'dashboard',  
            loadComponent: () => import('./pages/supervisor/dashboard/dashboard').then(m => m.Dashboard) 
          },
          {
            path: 'ventas',
            loadComponent: () => import('./shared/components/ventas/ventas').then(m => m.Ventas)
          },
          {
            path: 'clientes',
            loadComponent: () => import('./shared/components/clientes/clientes').then(m => m.Clientes)
          },
          {
            path: 'supervisor-equipo',
            loadComponent: () => import('./pages/supervisor/supervisor-equipo/supervisor-equipo').then(m => m.SupervisorEquipo)
          },
          {
            path: 'asignar-objetivo',
            loadComponent: () => import('./pages/supervisor/asignar-objetivo/asignar-objetivo').then(m => m.AsignarObjetivo)
          },
          {
            path: 'reporte-asesores',
            loadComponent: () => import('./shared/components/reporte-asesores/reporte-asesores').then(m => m.ReporteAsesores)
          },
        ]
      },

      // ── Módulo GERENTE ──
      {
        path: 'gerente',
        canActivate: [roleGuard(['GERENTE'])],
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { 
            path: 'dashboard', 
            loadComponent: () => import('./pages/gerente/dashboard/dashboard').then(m => m.Dashboard) 
          },
          {
            path: 'ventas',
            loadComponent: () => import('./shared/components/ventas/ventas').then(m => m.Ventas)
          },
          {
            path: 'clientes',
            loadComponent: () => import('./shared/components/clientes/clientes').then(m => m.Clientes)
          },
          {
            path: 'asignar-supervisor',
            loadComponent: () => import('./pages/gerente/asignar-supervisor/asignar-supervisor').then(m => m.AsignarSupervisor)
          },
          {
            path: 'crear-campana',
            loadComponent: () => import('./pages/gerente/crear-campana/crear-campana').then(m => m.CrearCampana)
          },
          {
            path: 'gestion-usuarios',
            loadComponent: () => import('./pages/gerente/gestion-usuarios/gestion-usuarios').then(m => m.GestionUsuarios)
          },
          {
            path: 'generar-reporte',
            loadComponent: () => import('./shared/components/generar-reporte/generar-reporte').then(m => m.GenerarReporte)
          },
          {
            path: 'reporte-asesores',
            loadComponent: () => import('./shared/components/reporte-asesores/reporte-asesores').then(m => m.ReporteAsesores)
          },
          {
            path: 'asignar-objetivo',
            loadComponent: () => import('./pages/gerente/asignar-objetivos/asignar-objetivos').then(m => m.AsignarObjetivos)
          },
          {
            path: 'reporte-supervisor',
            loadComponent: () => import('./pages/gerente/reporte-supervisor/reporte-supervisor').then(m => m.ReporteSupervisor)
          },
        ]
      },

      // ── Módulo BACK OFFICE ──
      {
        path: 'backoffice',
        canActivate: [roleGuard(['BACK_OFFICE', 'GERENTE'])],
        children: [
          { path: '', redirectTo: 'ventas', pathMatch: 'full' },
          {
            path: 'ventas',
            loadComponent: () => import('./shared/components/ventas/ventas').then(m => m.Ventas)
          },
          {
            path: 'clientes',
            loadComponent: () => import('./shared/components/clientes/clientes').then(m => m.Clientes)
          },
          {
            path: 'estado-venta',
            loadComponent: () => import('./pages/backoffice/estado-venta/estado-venta').then(m => m.EstadoVenta)
          },
          {
            path: 'generar-reporte',
            loadComponent: () => import('./shared/components/generar-reporte/generar-reporte').then(m => m.GenerarReporte)
          },
        ]
      },

      // Redirección inicial al entrar al sistema
      { path: '', redirectTo: 'asesor', pathMatch: 'full' }
    ]
  },

  // ── RUTAS DE ERROR ────────────────────────────────────────
  { 
    path: 'no-autorizado', 
    loadComponent: () => import('./pages/unauthorized').then(m => m.UnauthorizedComponent) 
  },
  { path: '**', redirectTo: 'login' }
];