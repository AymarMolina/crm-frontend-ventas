import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VentasService } from '../../../core/services/ventas.service';
import { AlertasStateService } from '../../../core/services/alertas-state.service';
import { VentaForm } from '../venta-form/venta-form';

export interface AlertaVenta {
  id: string;
  codigoVenta: string;
  clienteNombre: string;
  alertaDetalle: string;
  estado: string;
  actualizadoEn: string;
  alertaExpiraEn?: string | null; // ← nuevo campo
}
@Component({
  selector: 'app-alerta',
  imports: [FormsModule,CommonModule,VentaForm],
  templateUrl: './alerta.html',
  styleUrl: './alerta.css',
})
export class Alerta implements OnInit {
  alertas: AlertaVenta[] = [];
  loading = true;
  error = false;

  mostrarFormVenta = false;  

  constructor(private ventasService: VentasService,private cdr: ChangeDetectorRef,  private alertasState: AlertasStateService  // agrega esto
) {}

  ngOnInit(): void {
    this.cargarAlertas();
  }

  cargarAlertas(): void {
    this.loading = true;
    this.ventasService.getAlertas().subscribe({
      next: (data) => {
        this.alertas = data;
        this.loading = false;
         this.cdr.detectChanges();
      },
      error: () => {
        this.error = true;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarEstado(venta: AlertaVenta, nuevoCodigo: string, motivo: string): void {
    this.ventasService.cambiarEstado(venta.id, { estadoCodigo: nuevoCodigo, motivo }).subscribe({
      next: () => {
        this.alertasState.cargar(); // actualiza el badge del navbar también
        this.cargarAlertas();
      }
    });
  }
  onVentaGuardada(venta: any) {
    this.mostrarFormVenta = false;
  }
  esCaida(alerta: AlertaVenta): boolean {
    return alerta.estado === 'CAIDA' || alerta.estado === 'Caída';
  }

  archivarCaida(alerta: AlertaVenta): void {
    this.ventasService.archivarCaida(alerta.id).subscribe({
      next: () => {
        this.alertasState.cargar();
        this.cargarAlertas();
      }
    });
  }  
}