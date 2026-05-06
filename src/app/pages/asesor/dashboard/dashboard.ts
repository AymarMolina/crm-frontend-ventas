import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageResponse, Venta } from '../../../core/models/crm.models';
import { VentasService } from '../../../core/services/ventas.service';
import { AuthService } from '../../../core/services/auth.service';
import { VentaForm } from "../venta-form/venta-form";
import Chart from 'chart.js/auto';
import { DashboardService } from '../../../core/services/dashboardasesor.service';


@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, VentaForm],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  resumen: any;
  ventas: Venta[] = [];
  loading = true;
  loadingVentas = true;

  chartTendencia: any;
  chartCampana: any;

  constructor(
    private dashboardService: DashboardService,
    private ventasService: VentasService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {} 

mostrarFormVenta = false;  // 👈

onVentaGuardada(venta: any) {
  this.mostrarFormVenta = false;
  this.cargarDatos();   // refresca el dashboard
  this.cargarVentas();  // refresca la tabla
}
ngOnInit(): void {
  this.cargarDatos(); // Las ventas se cargan DESPUÉS del dashboard
}

cargarDatos() {
  this.loading = true;
  this.dashboardService.getDashboardData('15d').subscribe({
    next: (data) => {
      this.resumen = data.resumen;
      this.loading = false;
      this.cdr.detectChanges();
      requestAnimationFrame(() => {
        this.initCharts(data);
        this.cargarVentas(); // 👈 Espera que el DOM esté listo
      });
    },
    error: (err) => {
      console.error('Error cargando dashboard', err);
      this.loading = false;
      this.cdr.detectChanges();
      this.cargarVentas(); // igual carga ventas si falla el resumen
    }
  });
}

cargarVentas() {
  this.loadingVentas = true;
  
  // Obtén el ID del agente logueado para filtrar solo SUS ventas
  const agenteId = this.authService.obtenerUsuarioId(); // ajusta según tu AuthService
  
  this.ventasService.listar({ 
    agenteId: agenteId ?? undefined,
    page: 0, 
    size: 10  // solo 10 registros, no más
  }).subscribe({
    next: (res) => {
      this.ventas = res.content;
      this.loadingVentas = false;
      this.cdr.detectChanges();
    },
    error: () => { 
      this.loadingVentas = false; 
      this.cdr.detectChanges();
    }
  });
}


  ngOnDestroy(): void {
    if (this.chartTendencia) this.chartTendencia.destroy();
    if (this.chartCampana) this.chartCampana.destroy();
  }


  initCharts(data: any) {
    if (this.chartTendencia) this.chartTendencia.destroy();
    if (this.chartCampana) this.chartCampana.destroy();

    const ctxTendencia = document.getElementById('tendenciaChart') as HTMLCanvasElement;
    const ctxCampana = document.getElementById('campanaChart') as HTMLCanvasElement;

    if (ctxTendencia) {
      this.chartTendencia = new Chart(ctxTendencia, {
        type: 'line',
        data: {
          labels: data.tendencia.map((t: any) => t.fecha),
          datasets: [{
            label: 'Monto Ventas (S/)',
            data: data.tendencia.map((t: any) => t.monto),
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: { responsive: true }
      });
    }

    if (ctxCampana) {
      this.chartCampana = new Chart(ctxCampana, {
        type: 'doughnut',
        data: {
          labels: data.porCampana.map((c: any) => c.campana),
          datasets: [{
            data: data.porCampana.map((c: any) => c.total),
            backgroundColor: ['#6366f1', '#a855f7', '#ec4899', '#f59e0b']
          }]
        },
        options: { responsive: true }
      });
    }
  }

  getBadgeClass(estado: string): string {
    const map: Record<string, string> = {
      'ACTIVO': 'bg-green-100 text-green-700',
      'PENDIENTE': 'bg-yellow-100 text-yellow-700',
      'CANCELADO': 'bg-red-100 text-red-700',
      'COMPLETADO': 'bg-blue-100 text-blue-700',
    };
    return map[estado] ?? 'bg-gray-100 text-gray-600';
  }
}