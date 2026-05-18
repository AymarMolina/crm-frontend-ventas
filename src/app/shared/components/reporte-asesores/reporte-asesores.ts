import { ChangeDetectorRef, Component } from '@angular/core';
import { ReporteService } from '../../../core/services/reporte.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CampanasService } from '../../../core/services/campanas.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { RolReporte } from '../generar-reporte/generar-reporte';

interface Campana {
  id: string;
  nombre: string;
}

@Component({
  selector: 'app-reporte-asesores',
  imports: [ReactiveFormsModule,FormsModule,CommonModule],
  templateUrl: './reporte-asesores.html',
  styleUrl: './reporte-asesores.css',
})
export class ReporteAsesores {
  campanas: Campana[] = [];
  campanaId   = '';            // setear desde tu selector de campaña
  fechaDesde  = '';          // 'YYYY-MM-DD'
  fechaHasta  = '';
  cargando    = false;
  error       = '';
  rolUsuario: RolReporte = 'AGENTE';
  
  // ── Getters helpers de template ────────────────────────────────────────────
  get esAsesor():     boolean { return this.rolUsuario === 'AGENTE';     }
  get esSupervisor(): boolean { return this.rolUsuario === 'SUPERVISOR'; }
  get esGerente():    boolean { return this.rolUsuario === 'GERENTE';    }
  get esBackoffice():    boolean { return this.rolUsuario === 'BACK_OFFICE';}

  constructor(private reporteService: ReporteService,private campanasService: CampanasService,private cdr: ChangeDetectorRef,private authService: AuthService,) {}
  ngOnInit(): void {
    const rol = this.authService.getRol?.() ?? 'ASESOR';
    this.rolUsuario = rol as RolReporte;
    const hoy   = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.fechaHasta = this.toInputDate(hoy);
    this.fechaDesde = this.toInputDate(inicio);
    this.cargarCampanas();
   }
   // ── Helpers privados ───────────────────────────────────────────────────────
  private toInputDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
  descargar(): void {
    
    if (!this.fechaDesde || !this.fechaHasta) {  // campanaId ya no es obligatorio
      this.error = 'Completa las fechas antes de exportar.';
      return;
    }
    
    this.cargando = true;
    this.error    = '';
 
    this.reporteService
      .descargarReporteAsesores({
        campanaId:  this.campanaId,
        fechaDesde: this.fechaDesde,
        fechaHasta: this.fechaHasta
      })
      .subscribe({
        next: (blob: Blob) => {
          this.cargando = false;
          this.forzarDescarga(blob);
        },
        error: (err) => {
          this.cargando = false;
          this.error = 'Error al generar el reporte. Intenta nuevamente.';
          console.error(err);
        }
      });
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
  /** Crea un enlace temporal y simula el click para forzar la descarga del archivo */
  private forzarDescarga(blob: Blob): void {
    const hoy      = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `reporte_asesores_${hoy}.xlsx`;
 
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);  // liberar memoria
  }
}
