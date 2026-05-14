import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AgenteEquipo, ObjetivoResponse, ObjetivoService } from '../../../core/services/objetivo.service';
import { Chart } from 'chart.js';
import { VentasService } from '../../../core/services/ventas.service';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { Venta } from '../../../core/models/crm.models';
import { CommonModule, DecimalPipe } from '@angular/common';

export interface AsesorData {
  agente: AgenteEquipo;
  objetivos: ObjetivoResponse[];
  ventasPorCampana: Record<string, number>;
  totalVentas: number;
  cargando: boolean;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule,DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
 
  loading = true;
  equipoData: AsesorData[] = [];
 
  private charts: Record<string, Chart> = {};
 
  private readonly AVATAR_COLORS = [
    '#6366f1','#ec4899','#14b8a6','#f59e0b',
    '#84cc16','#06b6d4','#8b5cf6','#f97316',
  ];
 
  constructor(
    private objetivoService: ObjetivoService,
    private ventasService: VentasService,
    private cdr: ChangeDetectorRef,
  ) {}
 
  // ── CICLO DE VIDA ────────────────────────────────────────────
  ngOnInit(): void {
    this.cargarEquipo();
     this.cdr.detectChanges();
  }
 
  ngOnDestroy(): void {
    Object.values(this.charts).forEach(c => c.destroy());
  }
 
  cargarEquipo(): void {
    this.loading = true;

    this.objetivoService.getMiEquipo().pipe(
      switchMap(equipo => {
        if (equipo.length === 0) return of([]);

        const requests = equipo.map(agente =>
          forkJoin({
            objetivos: this.objetivoService.getObjetivosPorUsuario(agente.id).pipe(
              catchError(() => of([] as ObjetivoResponse[]))
            ),
            ventas: this.ventasService.ventasdeAgente(agente.id, 0, 500).pipe(
              catchError(() => of({ content: [] as Venta[], totalElements: 0, totalPages: 0, page: 0, size: 500, last: true }))
            ),
          }).pipe(
            switchMap(({ objetivos, ventas }) => {
              const activas = ventas.content.filter(v => v.estadoCodigo === 'ACTIVO' && !v.eliminado);
              const ventasPorCampana = activas.reduce((acc, v) => {
                acc[v.campanaId] = (acc[v.campanaId] ?? 0) + 1;
                return acc;
              }, {} as Record<string, number>);

              return of({
                agente,
                objetivos,
                ventasPorCampana,
                totalVentas: activas.length,
                cargando: false,
              } as AsesorData);
            })
          )
        );

        return forkJoin(requests);
      }),
      catchError(err => {
        console.error('Error:', err);
        return of([] as AsesorData[]);
      })
    ).subscribe(data => {
      this.equipoData = data;
      this.loading = false;
      
      // ✅ Forzamos detección de cambios inmediata
      this.cdr.detectChanges();

      // ✅ Esperamos 2 ciclos: uno para quitar loading, otro para renderizar el DOM completo
      setTimeout(() => {
        requestAnimationFrame(() => {
          this.renderAllCharts();
        });
      }, 100); // ← Aumentado de 0 a 100ms para dar margen
    });
  }
  private renderAllCharts(): void {
    this.initDonutEquipo();
    this.initBarrasChart();
    this.initContribucionChart();
    this.initMiniDonuts();
  }
  // ── KPIs GLOBALES ────────────────────────────────────────────
  get totalVentasEquipo(): number {
    return this.equipoData.reduce((s, a) => s + a.totalVentas, 0);
  }
 
  get promedioEquipo(): number {
    if (this.equipoData.length === 0) return 0;
    const suma = this.equipoData.reduce((s, a) => s + this.getPromedio(a), 0);
    return Math.round(suma / this.equipoData.length);
  }
 
  get totalCompletados(): number {
    return this.equipoData.filter(a => this.getPromedio(a) >= 100).length;
  }
 
  get asesorCompletado(): number { return this.equipoData.filter(a => this.getPromedio(a) >= 100).length; }
  get asesorEnProgreso(): number { return this.equipoData.filter(a => { const p = this.getPromedio(a); return p >= 50 && p < 100; }).length; }
  get asesorInicio():    number { return this.equipoData.filter(a => this.getPromedio(a) < 50).length; }
 
  get rankingAsesores(): AsesorData[] {
    return [...this.equipoData].sort((a, b) => this.getPromedio(b) - this.getPromedio(a));
  }
 
  // ── HELPERS DE DATOS ─────────────────────────────────────────
  getVentasActuales(asesor: AsesorData, obj: ObjetivoResponse): number {
    if (obj.ventasActivas !== undefined) return obj.ventasActivas;
    return asesor.ventasPorCampana[obj.campanaId] ?? 0;
  }
 
  getPorcentaje(asesor: AsesorData, obj: ObjetivoResponse): number {
    const actual = this.getVentasActuales(asesor, obj);
    if (obj.objetivoVentas === 0) return 0;
    return Math.min(Math.round((actual / obj.objetivoVentas) * 100), 100);
  }
 
  getPromedio(asesor: AsesorData): number {
    if (asesor.objetivos.length === 0) return 0;
    const suma = asesor.objetivos.reduce((s, o) => s + this.getPorcentaje(asesor, o), 0);
    return Math.round(suma / asesor.objetivos.length);
  }
 
  // ── HELPERS DE UI ────────────────────────────────────────────
  getInitials(n: string, a: string): string { return (n?.[0] ?? '') + (a?.[0] ?? ''); }
 
  getAvatarColor(nombre: string): string {
    return this.AVATAR_COLORS[(nombre?.charCodeAt(0) ?? 0) % this.AVATAR_COLORS.length];
  }
 
  getPosClass(i: number): string {
    if (i === 0) return 'pos pos--gold';
    if (i === 1) return 'pos pos--silver';
    if (i === 2) return 'pos pos--bronze';
    return 'pos';
  }
 
  getPctClass(pct: number): string {
    if (pct >= 100) return 'pct-green';
    if (pct >= 50)  return 'pct-indigo';
    if (pct >= 25)  return 'pct-amber';
    return 'pct-red';
  }
 
  getBarClass(pct: number): string {
    if (pct >= 100) return 'bar-green';
    if (pct >= 50)  return 'bar-indigo';
    if (pct >= 25)  return 'bar-amber';
    return 'bar-red';
  }
 
  getBarClassPct(pct: number): string { return this.getBarClass(pct); }
 
  getBadgeClass(asesor: AsesorData): string {
    const p = this.getPromedio(asesor);
    if (p >= 100) return 'badge-done';
    if (p >= 50)  return 'badge-prog';
    return 'badge-init';
  }
 
  getBadgeLabel(asesor: AsesorData): string {
    const p = this.getPromedio(asesor);
    if (p >= 100) return '✓ Completado';
    if (p >= 50)  return '▶ En progreso';
    return '○ Inicio';
  }
 
  trackById(_: number, item: AsesorData): string { return item.agente.id; }
 
  // ── GRÁFICOS ─────────────────────────────────────────────────
 
  /** Donut grande: progreso promedio del equipo */
  private initDonutEquipo(): void {
    const canvas = document.getElementById('donutEquipo') as HTMLCanvasElement;
    if (!canvas) return;
    this.charts['donutEquipo']?.destroy();
 
    const pct = this.promedioEquipo;
    const color = pct >= 100 ? '#22c55e' : pct >= 50 ? '#6366f1' : pct >= 25 ? '#f59e0b' : '#ef4444';
 
    this.charts['donutEquipo'] = new Chart(canvas, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [pct, Math.max(0, 100 - pct)],
          backgroundColor: [color, '#f1f5f9'],
          borderWidth: 0,
          borderRadius: 8,
        }]
      },
      options: {
        cutout: '76%',
        responsive: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        animation: { duration: 1000, easing: 'easeInOutQuart' },
      }
    });
  }
 
  /** Barras: ventas reales vs meta por asesor */
  private initBarrasChart(): void {
    const canvas = document.getElementById('barrasChart') as HTMLCanvasElement;
    if (!canvas || this.equipoData.length === 0) return;
    this.charts['barras']?.destroy();
 
    const labels = this.equipoData.map(a =>
      a.agente.nombres + ' ' + a.agente.apellidos[0] + '.'
    );
 
    // Suma de metas y ventas por asesor (todos sus objetivos)
    const metas = this.equipoData.map(a =>
      a.objetivos.reduce((s, o) => s + o.objetivoVentas, 0)
    );
    const realizadas = this.equipoData.map(a =>
      a.objetivos.reduce((s, o) => s + this.getVentasActuales(a, o), 0)
    );
 
    this.charts['barras'] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Meta',
            data: metas,
            backgroundColor: '#e0e7ff',
            borderRadius: 6,
            barThickness: 28,
            order: 2,
          },
          {
            label: 'Realizadas',
            data: realizadas,
            backgroundColor: '#6366f1',
            borderRadius: 6,
            barThickness: 28,
            order: 1,
          },
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { font: { family: 'Outfit' } } },
          tooltip: {
            callbacks: {
              afterLabel: (item: { dataIndex: number }) => {
                const r = realizadas[item.dataIndex];
                const m = metas[item.dataIndex];
                return m > 0 ? `Avance: ${Math.round((r / m) * 100)}%` : '';
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, grid: { color: '#f1f5f9' } }
        }
      } as any
    });
  }
 
  /** Barras horizontales: % de ventas aportadas al total del equipo */
  private initContribucionChart(): void {
    const canvas = document.getElementById('contribucionChart') as HTMLCanvasElement;
    if (!canvas || this.equipoData.length === 0) return;
    this.charts['contribucion']?.destroy();
 
    const total = this.totalVentasEquipo || 1;
    const labels = this.equipoData.map(a => a.agente.nombres);
    const data   = this.equipoData.map(a => Math.round((a.totalVentas / total) * 100));
    const colors = this.equipoData.map(a => this.getAvatarColor(a.agente.nombres));
 
    this.charts['contribucion'] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: '% de ventas',
          data,
          backgroundColor: colors,
          borderRadius: 6,
          barThickness: 22,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (i: { raw: unknown }) => ` ${i.raw}% del equipo` } }
        },
        scales: {
          x: { max: 100, grid: { color: '#f1f5f9' }, ticks: { callback: (v: string | number) => v + '%' } },
          y: { grid: { display: false } }
        }
      } as any
    });
  }
 
  /** Mini donuts de cada asesor en las cards de detalle */
  private initMiniDonuts(): void {
    this.equipoData.forEach(asesor => {
      if (asesor.objetivos.length === 0) return;
 
      const id = `minidonut-${asesor.agente.id}`;
      this.charts[id]?.destroy();
 
      const canvas = document.getElementById(id) as HTMLCanvasElement;
      if (!canvas) return;
 
      const pct   = this.getPromedio(asesor);
      const color = pct >= 100 ? '#22c55e' : pct >= 50 ? '#6366f1' : pct >= 25 ? '#f59e0b' : '#ef4444';
 
      this.charts[id] = new Chart(canvas, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [pct, Math.max(0, 100 - pct)],
            backgroundColor: [color, '#f1f5f9'],
            borderWidth: 0,
            borderRadius: 4,
          }]
        },
        options: {
          cutout: '70%',
          responsive: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          animation: { duration: 800, easing: 'easeInOutQuart' },
        }
      });
    });
  }
}
 