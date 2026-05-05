import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageResponse, Venta } from '../../../core/models/crm.models';
import { VentasService } from '../../../core/services/ventas.service';
import { AuthService } from '../../../core/services/auth.service';
import { VentaForm } from "../venta-form/venta-form";
import Chart from 'chart.js/auto';

// ── Interfaces mínimas (ajusta a tus modelos reales) ──────────────────────────
 
export interface ResumenAsesor {
  ventasActivas:     number;
  objetivo:          number;
  montoTotal:        number;
  comisionEstimada:  number;
  alertas:           number;
}
 
export interface VentaResumen {
  id:                string;
  codigo_venta:      string;
  cliente_nombre:    string;
  campana:           string;
  monto:             number;
  comision_generada: number;
  estado:            string;
  estado_codigo:     string;   // 'ACTIVO' | 'EN_PROCESO' | 'OBSERVADO' | 'CAIDA'
  fecha_venta:       string;
}
 
export interface AlertaVenta {
  id:             string;
  codigo_venta:   string;
  cliente_nombre: string;
  alerta_detalle: string;
  estado:         string;
  actualizado_en: string;
}
 
export interface TendenciaDia {
  fecha:  string;
  monto:  number;
}
 
export interface VentasPorCampana {
  campana: string;
  total:   number;
}
 
export interface EstadoConteo {
  estado:  string;
  codigo:  string;
  total:   number;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, VentaForm],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
 
  // ── Estado ──────────────────────────────────────────────────────────────────
  resumen:        ResumenAsesor | null = null;
  ventas:         VentaResumen[]       = [];
  alertas:        AlertaVenta[]        = [];
  tendencia:      TendenciaDia[]       = [];
  porCampana:     VentasPorCampana[]   = [];
  porEstado:      EstadoConteo[]       = [];
 
  showModal       = false;
  cargando        = false;
  periodoActivo   = '15d';
 
  periodos = [
    { label: '7d',  value: '7d'  },
    { label: '15d', value: '15d' },
    { label: 'Mes', value: 'mes' },
  ];
 
  // ── Charts ──────────────────────────────────────────────────────────────────
  private lineChart:     Chart | null = null;
  private doughnutChart: Chart | null = null;
  private metaChart:     Chart | null = null;
  private estadoChart:   Chart | null = null;
 
  private destroy$ = new Subject<void>();
 
  // ── Colores (sin var() — Chart.js no resuelve CSS vars) ─────────────────────
  private readonly COLORS = {
    blue:   '#3266ad',
    teal:   '#1d9e75',
    amber:  '#ba7517',
    red:    '#a32d2d',
    purple: '#534ab7',
    blueBg: 'rgba(50,102,173,0.12)',
    grid:   'rgba(255,255,255,0.06)',
    tick:   '#64748b',
    empty:  'rgba(255,255,255,0.07)',
  };
 
  // ── Usuario del JWT ──────────────────────────────────────────────────────────
  get nombreUsuario(): string {
    return this.authService.getNombreCompleto() ?? 'Asesor';
  }
 
  get inicialesUsuario(): string {
    const n = this.nombreUsuario.trim().split(' ');
    return n.length >= 2
      ? (n[0][0] + n[1][0]).toUpperCase()
      : this.nombreUsuario.slice(0, 2).toUpperCase();
  }
 
  get pctAlcance(): number {
    if (!this.resumen?.objetivo) return 0;
    return Math.min(
      Math.round((this.resumen.ventasActivas / this.resumen.objetivo) * 100),
      100
    );
  }
 
  // ── Constructor ─────────────────────────────────────────────────────────────
  constructor(
    private ventasService: VentasService,
    private authService:   AuthService,
    private cdr:           ChangeDetectorRef,
  ) {}
 
  // ── Lifecycle ────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.cargarDatos();
  }
 
  ngAfterViewInit(): void {
    // Los charts se renderizan después de que los datos lleguen (ver cargarDatos)
  }
 
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destruirCharts();
  }
 
  // ── Carga de datos ───────────────────────────────────────────────────────────
  cargarDatos(): void {
    this.cargando = true;
 
    forkJoin({
      resumen:    this.ventasService.getResumenAsesor(this.periodoActivo),
      ventas:     this.ventasService.getVentasAsesor(this.periodoActivo),
      alertas:    this.ventasService.getAlertasAsesor(),
      tendencia:  this.ventasService.getTendenciaAsesor(this.periodoActivo),
      porCampana: this.ventasService.getVentasPorCampanaAsesor(this.periodoActivo),
      porEstado:  this.ventasService.getVentasPorEstadoAsesor(this.periodoActivo),
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.cargando = false; this.cdr.detectChanges(); })
    )
    .subscribe({
      next: (data) => {
        this.resumen    = data.resumen;
        this.ventas     = data.ventas;
        this.alertas    = data.alertas;
        this.tendencia  = data.tendencia;
        this.porCampana = data.porCampana;
        this.porEstado  = data.porEstado;
 
        this.cdr.detectChanges();
 
        // Renderizar charts después del detectChanges (el canvas ya existe en el DOM)
        setTimeout(() => this.renderizarCharts(), 0);
      },
      error: (err) => console.error('Error cargando dashboard:', err),
    });
  }
 
  cambiarPeriodo(periodo: string): void {
    this.periodoActivo = periodo;
    this.destruirCharts();
    this.cargarDatos();
  }
 
  // ── Charts ───────────────────────────────────────────────────────────────────
  private renderizarCharts(): void {
    this.renderLineChart();
    this.renderDoughnutChart();
    this.renderMetaChart();
    this.renderEstadoChart();
  }
 
  private destruirCharts(): void {
    [this.lineChart, this.doughnutChart, this.metaChart, this.estadoChart]
      .forEach(c => c?.destroy());
    this.lineChart     = null;
    this.doughnutChart = null;
    this.metaChart     = null;
    this.estadoChart   = null;
  }
 
  private renderLineChart(): void {
    const canvas = document.getElementById('daLineChart') as HTMLCanvasElement;
    if (!canvas) return;
 
    const labels = this.tendencia.map(d => d.fecha);
    const data   = this.tendencia.map(d => d.monto);
 
    this.lineChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Ventas (S/)',
          data,
          borderColor:     this.COLORS.blue,
          backgroundColor: this.COLORS.blueBg,
          fill:      true,
          tension:   0.4,
          pointRadius:      3,
          pointHoverRadius: 6,
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid:  { color: this.COLORS.grid },
            ticks: { color: this.COLORS.tick, font: { size: 10 }, maxTicksLimit: 8 },
          },
          y: {
            beginAtZero: true,
            grid:  { color: this.COLORS.grid },
            ticks: {
              color: this.COLORS.tick,
              font:  { size: 10 },
              callback: (v) => 'S/' + v,
            },
          },
        },
      },
    });
  }
 
  private renderDoughnutChart(): void {
    const canvas = document.getElementById('daDoughnutChart') as HTMLCanvasElement;
    if (!canvas) return;
 
    const labels = this.porCampana.map(c => c.campana);
    const data   = this.porCampana.map(c => c.total);
    const colors = [this.COLORS.blue, this.COLORS.teal, this.COLORS.amber, this.COLORS.purple, this.COLORS.red];
 
    // Leyenda personalizada
    const legendEl = document.getElementById('daDonutLegend');
    if (legendEl) {
      legendEl.innerHTML = labels.map((l, i) => {
        const pct = data.reduce((a, b) => a + b, 0) > 0
          ? Math.round((data[i] / data.reduce((a, b) => a + b, 0)) * 100)
          : 0;
        return `<span class="da-legend-item">
          <span class="da-legend-dot" style="background:${colors[i % colors.length]}"></span>
          ${l} ${pct}%
        </span>`;
      }).join('');
    }
 
    this.doughnutChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 0,
          hoverOffset: 8,
        }],
      },
      options: {
        cutout: '68%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    });
  }
 
  private renderMetaChart(): void {
    const canvas = document.getElementById('daMetaChart') as HTMLCanvasElement;
    if (!canvas) return;
 
    const alcanzado = this.resumen?.ventasActivas ?? 0;
    const objetivo  = this.resumen?.objetivo      ?? 1;
    const restante  = Math.max(objetivo - alcanzado, 0);
 
    this.metaChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Mi meta'],
        datasets: [
          {
            label:           'Alcanzado',
            data:            [alcanzado],
            backgroundColor: this.COLORS.teal,
            borderRadius:    4,
            borderSkipped:   false,
          },
          {
            label:           'Restante',
            data:            [restante],
            backgroundColor: this.COLORS.empty,
            borderRadius:    4,
            borderSkipped:   false,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            stacked: true,
            max:     objetivo,
            grid:    { color: this.COLORS.grid },
            ticks:   { color: this.COLORS.tick, font: { size: 10 } },
          },
          y: {
            stacked: true,
            grid:    { display: false },
            ticks:   { display: false },
          },
        },
      },
    });
  }
 
  private renderEstadoChart(): void {
    const canvas = document.getElementById('daEstadoChart') as HTMLCanvasElement;
    if (!canvas) return;
 
    const colorMap: Record<string, string> = {
      ACTIVO:     this.COLORS.teal,
      EN_PROCESO: this.COLORS.blue,
      OBSERVADO:  this.COLORS.amber,
      CAIDA:      this.COLORS.red,
    };
 
    const labels = this.porEstado.map(e => e.estado);
    const data   = this.porEstado.map(e => e.total);
    const bgColors = this.porEstado.map(e => colorMap[e.codigo] ?? this.COLORS.blue);
 
    // Leyenda personalizada
    const legendEl = document.getElementById('daEstadoLegend');
    if (legendEl) {
      legendEl.innerHTML = this.porEstado.map((e, i) =>
        `<span class="da-legend-item">
          <span class="da-legend-dot" style="background:${bgColors[i]}"></span>
          ${e.estado} (${e.total})
        </span>`
      ).join('');
    }
 
    this.estadoChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label:           'Ventas',
          data,
          backgroundColor: bgColors,
          borderRadius:    5,
          borderSkipped:   false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false },      ticks: { color: this.COLORS.tick, font: { size: 11 } } },
          y: { grid: { color: this.COLORS.grid }, ticks: { color: this.COLORS.tick, font: { size: 10 } } },
        },
      },
    });
  }
 
  // ── Modal ────────────────────────────────────────────────────────────────────
  abrirModalVenta(): void {
    this.showModal = true;
  }
 
  cerrarModal(): void {
    this.showModal = false;
  }
 
  finalizarVenta(ventaGenerada: any): void {
    console.log('Venta exitosa:', ventaGenerada);
    this.cerrarModal();
    this.destruirCharts();
    this.cargarDatos();   // Refresca todo al guardar
  }
}