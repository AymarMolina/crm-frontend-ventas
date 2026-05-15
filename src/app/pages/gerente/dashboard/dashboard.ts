import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AgenteRendimientoResponse, CampanaSelectorResponse, DashboardGerenteResponse, DashboardGerenteService } from '../../../core/services/dashboardgerente.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
colorEstadoBadge(arg0: string): string|string[]|Set<string>|{ [klass: string]: any; }|null|undefined {
throw new Error('Method not implemented.');
}
  private readonly svc = inject(DashboardGerenteService);
 
  campanas = signal<CampanaSelectorResponse[]>([]);
  campanaSeleccionada = signal<string>('');
  dashboard = signal<DashboardGerenteResponse | null>(null);
  cargando = signal(false);
  error = signal<string | null>(null);
 
  // Nombre del mes en español
  nombreMes = computed(() => {
    const d = this.dashboard();
    if (!d) return '';
    return new Date(d.campana.anio, d.campana.mes - 1).toLocaleString('es-PE', { month: 'long' });
  });
 
  ngOnInit(): void {
    this.svc.getCampanas().subscribe({
      next: (list) => {
        this.campanas.set(list);
        if (list.length > 0) {
          this.campanaSeleccionada.set(list[0].id);
          this.cargarDashboard(list[0].id);
        }
      },
      error: () => this.error.set('No se pudo cargar la lista de campañas.'),
    });
  }
 
  onCampanaChange(id: string): void {
    this.campanaSeleccionada.set(id);
    this.cargarDashboard(id);
  }
 
  private cargarDashboard(id: string): void {
    this.cargando.set(true);
    this.error.set(null);
    this.svc.getDashboard(id).subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al cargar el dashboard.');
        this.cargando.set(false);
      },
    });
  }
 
  // Helpers de vista
  estadoEntries(): { key: string; value: number }[] {
    const d = this.dashboard();
    if (!d) return [];
    return Object.entries(d.distribucionEstados).map(([key, value]) => ({ key, value }));
  }
 
  getBgEstado(codigo: string): Record<string, string> {
    const map: Record<string, Record<string, string>> = {
      ACTIVO:     { background: '#f0f5ee', color: '#3a5c38', border: '1px solid #d0e0cd' },
      EN_PROCESO: { background: '#f5f0e8', color: '#6b5530', border: '1px solid #e0d0b0' },
      OBSERVADO:  { background: '#f5ede0', color: '#7a4f20', border: '1px solid #e0c8a0' },
      CAIDA:      { background: '#f5eaea', color: '#7a3030', border: '1px solid #e0b8b8' },
    };
    return map[codigo] ?? { background: '#f5f4f2', color: '#57534e', border: '1px solid #e2ded9' };
  }
 
  totalEstados(): number {
    const d = this.dashboard();
    if (!d) return 1;
    return Object.values(d.distribucionEstados).reduce((a, b) => a + b, 0) || 1;
  }
 
  pctBarra(valor: number): number {
    return Math.round((valor / this.totalEstados()) * 100);
  }
 
  trackByAgente(_: number, a: AgenteRendimientoResponse): string {
    return a.agenteId;
  }
 
  formatCurrency(val: number): string {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(val);
  }
 
  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}