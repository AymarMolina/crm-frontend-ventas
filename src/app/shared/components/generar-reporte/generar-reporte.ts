import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ReporteService, FiltroReporte } from '../../../core/services/reporte.service';
import { CampanasService } from '../../../core/services/campanas.service';

export type RolReporte = 'AGENTE' | 'SUPERVISOR' | 'GERENTE' | 'BACK_OFFICE';

interface Campana {
  id: string;
  nombre: string;
}

@Component({
  selector: 'app-generar-reporte',
  imports: [CommonModule, FormsModule],
  templateUrl: './generar-reporte.html',
  styleUrl: './generar-reporte.css',
})
export class GenerarReporte implements OnInit {

  // ── Estado de la UI ────────────────────────────────────────────────────────
  descargando = false;
  mensajeExito = '';
  mensajeError = '';

  // ── Filtros ────────────────────────────────────────────────────────────────
  fechaDesde: string = '';
  fechaHasta: string = '';
  campanaIdSeleccionada: string = '';

  // Campañas disponibles (cargadas desde el servicio si las tienes,
  // o puedes hardcodear para pruebas iniciales)
  campanas: Campana[] = [];

  // Rol del usuario autenticado (lo lees del AuthService)
  rolUsuario: RolReporte = 'AGENTE';

  // ── Getters helpers de template ────────────────────────────────────────────
  get esAsesor():     boolean { return this.rolUsuario === 'AGENTE';     }
  get esSupervisor(): boolean { return this.rolUsuario === 'SUPERVISOR'; }
  get esGerente():    boolean { return this.rolUsuario === 'GERENTE';    }
  get esBackoffice():    boolean { return this.rolUsuario === 'BACK_OFFICE';}

  get filtrosValidos(): boolean {
    return !!this.fechaDesde && !!this.fechaHasta && this.fechaDesde <= this.fechaHasta;
  }

  constructor(
    private authService: AuthService,
    private reporteService: ReporteService,
    private campanasService: CampanasService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const rol = this.authService.getRol?.() ?? 'ASESOR';
    this.rolUsuario = rol as RolReporte;
    const hoy   = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.fechaHasta = this.toInputDate(hoy);
    this.fechaDesde = this.toInputDate(inicio);
    this.cargarCampanas();
  }
  cargarCampanas() {
    this.campanasService.listarCampanas().subscribe((res: any) => {
      if (res.content && Array.isArray(res.content)) {
        this.campanas = res.content;
      } else if (Array.isArray(res)) {
        this.campanas = res;
      } else {
        this.campanas = [];
      }
      this.cdr.detectChanges();
    });
  }
  // ── Descarga principal ─────────────────────────────────────────────────────
  generarReporte(): void {
    if (!this.filtrosValidos) return;

    this.descargando = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    const filtro: FiltroReporte = {
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta,
      campanaId:  this.campanaIdSeleccionada || undefined,
      campanaNombre: this.campanas.find(c => c.id === this.campanaIdSeleccionada)?.nombre,
    };

    const descarga$ = this.esAsesor
      ? this.reporteService.descargarReporteAsesor(filtro)
      : this.esSupervisor
        ? this.reporteService.descargarReporteSupervisor(filtro)
        : this.reporteService.descargarReporteGerente(filtro);

    const nombreArchivo = this.buildNombreArchivo();

    descarga$.subscribe({
      next: (blob) => {
        this.reporteService.triggerDescarga(blob, nombreArchivo);
        this.mensajeExito = '¡Reporte descargado correctamente!';
        this.descargando  = false;
        setTimeout(() => this.mensajeExito = '', 4000);
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensajeError = 'No se pudo generar el reporte. Intenta nuevamente.';
        this.descargando  = false;
        setTimeout(() => this.mensajeError = '', 5000);
        this.cdr.detectChanges();
      },
    });
  }

  limpiarFiltros(): void {
    const hoy   = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.fechaDesde = this.toInputDate(inicio);
    this.fechaHasta = this.toInputDate(hoy);
    this.campanaIdSeleccionada = '';
  }

  // ── Helpers privados ───────────────────────────────────────────────────────
  private toInputDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  private buildNombreArchivo(): string {
    const rol   = this.rolUsuario.toLowerCase();
    const desde = this.fechaDesde.replace(/-/g, '');
    const hasta = this.fechaHasta.replace(/-/g, '');
    return `reporte_ventas_${rol}_${desde}_${hasta}.xlsx`;
  }

  // ── Utilidad de vista ──────────────────────────────────────────────────────
  get rangoLegible(): string {
    if (!this.fechaDesde || !this.fechaHasta) return '—';
    const fmt = (s: string) =>
      new Date(s + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
    return `${fmt(this.fechaDesde)} → ${fmt(this.fechaHasta)}`;
  }
}