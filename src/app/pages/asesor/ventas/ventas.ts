import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VentasService } from '../../../core/services/ventas.service';
import { AuthService } from '../../../core/services/auth.service';
import { PageResponse, Venta } from '../../../core/models/crm.models';

@Component({
  selector: 'app-ventas',
  imports: [FormsModule,CommonModule],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css',
})
export class Ventas implements OnInit {
  ventasPage: PageResponse<Venta> = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    page: 0,
    size: 8,
    last: true
  };
  loading = true;
  ventaSeleccionada: Venta | null = null;

  // Método para abrir el detalle
  verDetalle(venta: Venta): void {
    // Opcional: Podrías llamar al servicio aquí si quieres datos más frescos
    // this.ventasService.obtenerDetalle(venta.id).subscribe(...)
    this.ventaSeleccionada = venta;
  }
  fechaInicio: string = '';
  fechaFin: string = '';
  constructor(
    private ventasService: VentasService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.cargarVentas();
  }

  cargarVentas(page = 0): void {
    const agenteId = this.authService.obtenerUsuarioId();
    if (!agenteId) return;

    this.loading = true;
    
    // Aquí podrías extender tu VentasService para aceptar fechas 
    // o usar el método genérico 'listar' que ya teníamos
    this.ventasService.ventasdeAgente(agenteId, page, 8).subscribe({
      next: (res) => {
        // Lógica de filtrado local si el backend no soporta fechas todavía
        let data = res.content;
        if (this.fechaInicio && this.fechaFin) {
          data = data.filter(v => v.fechaVenta >= this.fechaInicio && v.fechaVenta <= this.fechaFin);
        }
        
        this.ventasPage = { ...res, content: data };
        this.loading = false;
        this.cdr.detectChanges(); 
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  limpiarFiltros(): void {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.cargarVentas(0);
  }
  calcularComisionHoy(): number {
    if (!this.ventasPage.content) return 0;
    return this.ventasPage.content.reduce((acc, v) => acc + (v.comisionGenerada || 0), 0);
  }
  calcularTotalHoy(): number {  
    if (!this.ventasPage.content) return 0;
    return this.ventasPage.content.reduce((acc, v) => acc + (v.monto || 0), 0);
  }
}