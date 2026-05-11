import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageResponse, Venta } from '../../../core/models/crm.models';
import { VentasService } from '../../../core/services/ventas.service';
import { AuthService } from '../../../core/services/auth.service';
import { VentaForm } from "../venta-form/venta-form";
import Chart from 'chart.js/auto';
import { DashboardService } from '../../../core/services/dashboardasesor.service';
import { ObjetivoResponse, ObjetivoService } from '../../../core/services/objetivo.service';
import { TooltipItem } from 'chart.js';

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
  todasLasVentas: Venta[] = [];

  objetivos: ObjetivoResponse[] = [];
 loadingObjetivos = true;

  chartTendencia: any;
  chartCampana: any;
  chartAvanceMeta: any;

  constructor(
    private dashboardService: DashboardService,
    private ventasService: VentasService,
    private authService: AuthService,
    private objetivoService: ObjetivoService,
    private cdr: ChangeDetectorRef
  ) {} 

mostrarFormVenta = false;  

ngOnInit(): void {
  this.cargarDatos(); 
  this.cargarObjetivos();
}
cargarObjetivos() {
  this.loadingObjetivos = true;
  this.objetivoService.getMisObjetivos().subscribe({
    next: (data) => {
      this.objetivos = data;
      this.loadingObjetivos = false;
      this.cargarVentasParaGrafico();
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Error cargando objetivos', err);
      this.loadingObjetivos = false;
      this.cdr.detectChanges();
    }
  });
}

onVentaGuardada(venta: any) {
  this.mostrarFormVenta = false;
  this.cargarDatos();   
  this.cargarVentas();  
  this.cargarObjetivos(); 
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
        this.cargarVentas(); 
      });
    },
    error: (err) => {
      console.error('Error cargando dashboard', err);
      this.loading = false;
      this.cdr.detectChanges();
      this.cargarVentas(); 
    }
  });
}

cargarVentas() {
  this.loadingVentas = true;
  
  const agenteId = this.authService.obtenerUsuarioId(); 
  
  this.ventasService.listar({ 
    agenteId: agenteId ?? undefined,
    page: 0, 
    size: 10  
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
cargarVentasParaGrafico() {
  const agenteId = this.authService.obtenerUsuarioId();

  this.ventasService.listar({
    agenteId: agenteId ?? undefined,
    page: 0,
    size: 1000  // traer todas
  }).subscribe({
    next: (res) => {
      this.todasLasVentas = res.content;
      setTimeout(() => this.initChartAvanceMeta(), 100);
    },
    error: () => {}
  });
}
initChartAvanceMeta() {
  if (this.chartAvanceMeta) this.chartAvanceMeta.destroy();

  const ctx = document.getElementById('avanceMetaChart') as HTMLCanvasElement;
  if (!ctx || !this.objetivos?.length) return;

  const labels = this.objetivos.map(o => o.campanaNombre);
  const ventasRealizadas = this.objetivos.map(o =>
    this.todasLasVentas.filter(v =>
      v.campanaId === o.campanaId && !v.eliminado
    ).length
  );
  const metas = this.objetivos.map(o => o.objetivoVentas);

  this.chartAvanceMeta = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Meta',
          data: metas,
          backgroundColor: '#e0e7ff',
          borderRadius: 6,
          barThickness: 24,       
          order: 2,                
        },
        {
          label: 'Ventas realizadas',
          data: ventasRealizadas,
          backgroundColor: '#4f46e5',
          borderRadius: 0,
          barThickness: 24,       
          order: 1,               
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            afterLabel: (tooltipItem: TooltipItem<'bar'>) => {
              const realizadas = ventasRealizadas[tooltipItem.dataIndex];
              const meta = metas[tooltipItem.dataIndex];
              const pct = meta > 0 ? Math.round((realizadas / meta) * 100) : 0;
              return `Avance: ${pct}%`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: Math.max(...metas) + 5,
          stacked: false
        },
        y: {
          stacked: true   
        }
      }
    } as any
  });
}

ngOnDestroy(): void {
  if (this.chartTendencia) this.chartTendencia.destroy();
  if (this.chartCampana) this.chartCampana.destroy();
  if (this.chartAvanceMeta) this.chartAvanceMeta.destroy();
}


initCharts(data: any) {
  if (this.chartTendencia) this.chartTendencia.destroy();
  if (this.chartCampana) this.chartCampana.destroy();

  const ctxTendencia = document.getElementById('tendenciaChart') as HTMLCanvasElement;
  const ctxCampana = document.getElementById('campanaChart') as HTMLCanvasElement;

  if (ctxTendencia) {
    const totalVentas = data.tendencia.reduce((sum: number, t: any) => sum + (t.cantidad ?? 0), 0);

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
    'ACTIVO': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'EN_PROCESO': 'bg-blue-100 text-blue-700 border-blue-200',
    'CAIDA': 'bg-red-100 text-red-700 border-red-200',
    'OBSERVADO': 'bg-amber-100 text-amber-700 border-amber-200',
  };
  return map[estado] ?? 'bg-gray-100 text-gray-600';
}
}