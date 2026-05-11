// alertas-state.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { VentasService } from './ventas.service';
import { AlertaVenta } from '../../pages/asesor/alerta/alerta';

@Injectable({ providedIn: 'root' }) // singleton
export class AlertasStateService implements OnDestroy {
  private _alertas = new BehaviorSubject<AlertaVenta[]>([]);
  alertas$ = this._alertas.asObservable();

  private intervalo!: ReturnType<typeof setInterval>;
  private cargando = false; // evita llamadas simultáneas

  constructor(private ventasService: VentasService) {
    this.cargar();
    this.intervalo = setInterval(() => this.cargar(), 60_000);
  }

  cargar(): void {
    if (this.cargando) return; // evita acumulación
    this.cargando = true;

    this.ventasService.getAlertas().subscribe({
      next: (data) => {
        this._alertas.next(data);
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalo);
  }
}