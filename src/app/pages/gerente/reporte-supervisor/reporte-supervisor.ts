import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CampanasService } from '../../../core/services/campanas.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, formatCurrency } from '@angular/common';

export interface FilaReporteSupervisor {
  campana: string;
  mes: number;
  anio: number;
  supervisorId: string;
  supervisor: string;
  metaSupervisor: number | null;
  comisionMaxSupervisor: number | null;
  agenteId: string;
  agente: string;
  metaAgente: number | null;
  comisionMaxAgente: number | null;
  ventasActivas: number;
  montoTotal: number;
  comisionGenerada: number;
  pctAlcanceAgente: number | null;
}

@Component({
  selector: 'app-reporte-supervisor',
  imports: [ReactiveFormsModule,FormsModule,CommonModule],
  templateUrl: './reporte-supervisor.html',
  styleUrl: './reporte-supervisor.css',
})
export class ReporteSupervisor implements OnInit {
 
  private readonly API = `${environment.apiUrl}/api`;
 
  campanas: any[] = [];
  campanaSeleccionada = '';
  filas: FilaReporteSupervisor[] = [];
 
  loading       = true;
  cargandoReporte = false;
  exportando    = false;
  error         = '';
 
  // ── Totales ──────────────────────────────────────────────────────────────
  get totalVentas()  { return this.filas.reduce((s, f) => s + (f.ventasActivas ?? 0), 0); }
  get totalMonto()   { return this.filas.reduce((s, f) => s + (f.montoTotal ?? 0), 0); }
  get totalComision(){ return this.filas.reduce((s, f) => s + (f.comisionGenerada ?? 0), 0); }
 
  constructor(
    private http: HttpClient,
    private campanaService: CampanasService,
    private cdr: ChangeDetectorRef
  ) {}
 
  ngOnInit(): void {
    this.campanaService.listarCampanas().subscribe({
      next: (c) => { this.campanas = c; this.loading = false; this.cdr.detectChanges(); },
      error: ()  => { this.loading = false; this.cdr.detectChanges(); }
    });
  }
 
  // ── Cargar reporte al cambiar campaña ────────────────────────────────────
  cargarReporte(): void {
    if (!this.campanaSeleccionada) { this.filas = []; return; }
 
    this.cargandoReporte = true;
    this.error = '';
    this.filas = [];
 
    this.http.get<FilaReporteSupervisor[]>(
      `${this.API}/reportes/supervisores/${this.campanaSeleccionada}`
    ).subscribe({
      next: (data) => {
        this.filas = data;
        this.cargandoReporte = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error?.message ?? 'Error al cargar el reporte.';
        this.cargandoReporte = false;
        this.cdr.detectChanges();
      }
    });
  }
 
  // ── Exportar Excel ───────────────────────────────────────────────────────
  exportarExcel(): void {
    if (!this.campanaSeleccionada) return;
 
    this.exportando = true;
 
    this.http.get(
      `${this.API}/reportes/supervisores/${this.campanaSeleccionada}/excel`,
      { responseType: 'blob' }
    ).subscribe({
      next: (blob) => {
        const url  = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href     = url;
        link.download = `reporte-supervisores.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.exportando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al generar el Excel.';
        this.exportando = false;
        this.cdr.detectChanges();
      }
    });
  }
 
  // ── Helpers de tabla ─────────────────────────────────────────────────────
 
  /** Detecta si es la primera fila de un grupo de supervisor */
  esPrimerDeGrupo(index: number): boolean {
    if (index === 0) return true;
    return this.filas[index].supervisorId !== this.filas[index - 1].supervisorId;
  }
 
  /** Color del badge según % alcance */
  getBadgeClass(pct: number | null): string {
    const v = pct ?? 0;
    if (v >= 100) return 'bg-[#d1fae5] text-[#065f46]';
    if (v >= 70)  return 'bg-[#fef9c3] text-[#92400e]';
    return 'bg-[#fee2e2] text-[#991b1b]';
  }
}
 
