import { AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AgenteEquipo, ObjetivoResponse, ObjetivoService } from '../../../core/services/objetivo.service';
import { Chart, registerables } from 'chart.js';
import { VentasService } from '../../../core/services/ventas.service';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { Venta } from '../../../core/models/crm.models';
import { CommonModule, DecimalPipe } from '@angular/common';

Chart.register(...registerables);
 
export interface AsesorData {
  agente: AgenteEquipo;
  objetivos: ObjetivoResponse[];
  ventasPorCampana: Record<string, number>; // campanaId → cantidad ventas ACTIVAS
  totalVentas: number;
  cargando: boolean;
}

@Component({
  selector: 'app-supervisor-equipo',
  imports: [CommonModule,DecimalPipe],
  templateUrl: './supervisor-equipo.html',
  styleUrl: './supervisor-equipo.css',
})
export class SupervisorEquipo implements OnInit, OnDestroy, AfterViewChecked {
 
  equipo: AgenteEquipo[] = [];
  equipoData: AsesorData[] = [];
  loading = true;
  error = false;
 
  private charts: Record<string, Chart> = {};
  private donutsPendientes = new Set<string>();
 
  private readonly AVATAR_COLORS = [
    '#6366f1', '#ec4899', '#14b8a6', '#f59e0b',
    '#84cc16', '#06b6d4', '#8b5cf6', '#f97316',
  ];
 
  constructor(
    private objetivoService: ObjetivoService,
    private ventasService: VentasService,
    private cdr: ChangeDetectorRef,
  ) {}
 
  // ── CICLO DE VIDA ─────────────────────────────────────────
  ngOnInit(): void {
    this.cargarEquipo();
    this.cdr.detectChanges();
  }
 
  ngAfterViewChecked(): void {
    this.donutsPendientes.forEach(id => {
      const canvas = document.getElementById(`donut-${id}`) as HTMLCanvasElement;
      if (canvas) {
        this.donutsPendientes.delete(id);
        this.dibujarDonut(id);
        this.cdr.detectChanges();
      }
    });
  }
 
  ngOnDestroy(): void {
    Object.values(this.charts).forEach(c => c.destroy());
  }
 
  // ── CARGA DE DATOS ────────────────────────────────────────
  cargarEquipo(): void {
    this.loading = true;
    this.error = false;
 
    this.objetivoService.getMiEquipo().pipe(
      switchMap(equipo => {
        this.equipo = equipo;
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
              // Solo contamos ventas ACTIVAS (no caídas ni eliminadas)
              const ventasActivas = ventas.content.filter(
                v => v.estadoCodigo === 'ACTIVO' && !v.eliminado
              );
              const ventasPorCampana = this.agruparPorCampana(ventasActivas);
              const asesorData: AsesorData = {
                agente,
                objetivos,
                ventasPorCampana,
                totalVentas: ventasActivas.length,
                cargando: false,
              };
              return of(asesorData);
            })
          )
        );
 
        return forkJoin(requests);
      }),
      catchError(err => {
        console.error('Error cargando equipo:', err);
        this.error = true;
        return of([] as AsesorData[]);
      })
    ).subscribe(data => {
      this.equipoData = data;
      this.loading = false;
      data.forEach(d => {
        if (d.objetivos.length > 0) {
          this.donutsPendientes.add(d.agente.id);
          this.cdr.detectChanges();
        }
      });
      this.cdr.detectChanges();
    });
  }
 
  // ── HELPERS DE DATOS ──────────────────────────────────────
 
  private agruparPorCampana(ventas: Venta[]): Record<string, number> {
    return ventas.reduce((acc, v) => {
      acc[v.campanaId] = (acc[v.campanaId] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
 
  getVentasActuales(asesor: AsesorData, obj: ObjetivoResponse): number {
    // Si el backend ya devuelve ventasActivas úsalas; si no, contamos localmente
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
 
  get totalCompletados(): number {
    return this.equipoData.reduce((sum, a) =>
      sum + a.objetivos.filter(o => this.getPorcentaje(a, o) >= 100).length, 0
    );
  }
 
  get totalVentasEquipo(): number {
    return this.equipoData.reduce((sum, a) => sum + a.totalVentas, 0);
  }
 
  // ── HELPERS DE UI ─────────────────────────────────────────
 
  getInitials(nombres: string, apellidos: string): string {
    return (nombres?.[0] ?? '') + (apellidos?.[0] ?? '');
  }
 
  getAvatarColor(nombre: string): string {
    const idx = (nombre?.charCodeAt(0) ?? 0) % this.AVATAR_COLORS.length;
    return this.AVATAR_COLORS[idx];
  }
 
  getBadgeClass(asesor: AsesorData): string {
    const pct = this.getPromedio(asesor);
    if (pct >= 100) return 'bg-green-100 text-green-700';
    if (pct >= 50)  return 'bg-purple-100 text-indigo-500';
    return 'bg-orange-50 text-orange-700';
  }
 
  getBadgeLabel(asesor: AsesorData): string {
    const pct = this.getPromedio(asesor);
    if (pct >= 100) return '✓ Completado';
    if (pct >= 50)  return '▶ En progreso';
    return '○ Inicio';
  }
 
  getBarClass(asesor: AsesorData, obj: ObjetivoResponse): string {
    const pct = this.getPorcentaje(asesor, obj);
    if (pct >= 100) return 'bg-gradient-to-r from-green-500 to-green-400';
    if (pct >= 50)  return 'bg-gradient-to-r from-indigo-500 to-indigo-400';
    if (pct >= 25)  return 'bg-gradient-to-r from-amber-500 to-amber-400';
    return 'bg-gradient-to-r from-red-500 to-red-400';
  }
 
  trackById(_: number, item: AsesorData): string {
    return item.agente.id;
  }
 
  // ── DONUT ─────────────────────────────────────────────────
  private dibujarDonut(agenteId: string): void {
    if (this.charts[agenteId]) {
      this.charts[agenteId].destroy();
      delete this.charts[agenteId];
    }
 
    const canvas = document.getElementById(`donut-${agenteId}`) as HTMLCanvasElement;
    if (!canvas) return;
 
    const asesor = this.equipoData.find(a => a.agente.id === agenteId);
    if (!asesor) return;
 
    const pct      = this.getPromedio(asesor);
    const restante = Math.max(0, 100 - pct);
 
    const color = pct >= 100 ? '#22c55e'
                : pct >= 50  ? '#6366f1'
                : pct >= 25  ? '#f59e0b'
                :              '#ef4444';
 
    this.charts[agenteId] = new Chart(canvas, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [pct, restante],
          backgroundColor: [color, '#f1f5f9'],
          borderWidth: 0,
          borderRadius: 6,
        }]
      },
      options: {
        cutout: '74%',
        responsive: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        animation: { duration: 900, easing: 'easeInOutQuart' },
      }
    });
  }
}