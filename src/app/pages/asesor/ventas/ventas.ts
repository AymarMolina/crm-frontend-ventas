import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VentasService } from '../../../core/services/ventas.service';
import { AuthService } from '../../../core/services/auth.service';
import { PageResponse, Venta } from '../../../core/models/crm.models';

@Component({
  selector: 'app-ventas',
  imports: [FormsModule, CommonModule],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css',
})
export class Ventas implements OnInit {

  loading = true;
  ventaSeleccionada: Venta | null = null;

  fechaInicio: string = '';
  fechaFin: string = '';
  textoBusqueda: string = '';

  readonly PAGE_SIZE = 8;
  paginaActual = 0;

  private _todos: Venta[] = [];
  ventasFiltradas: Venta[] = [];
  ventasPagina: Venta[] = [];

  get totalPages(): number {
    return Math.ceil(this.ventasFiltradas.length / this.PAGE_SIZE) || 1;
  }
  get esUltimaPagina(): boolean {
    return this.paginaActual >= this.totalPages - 1;
  }

  constructor(
    private ventasService: VentasService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarTodos();
  }

  cargarTodos(): void {
    const agenteId = this.authService.obtenerUsuarioId();
    if (!agenteId) return;

    this.loading = true;
    this.ventasService.ventasdeAgente(agenteId, 0, 1000).subscribe({
      next: (res) => {
        this._todos = res.content;
        console.log(this._todos)
        this._aplicarFiltrosYPaginar(0);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  verDetalle(venta: Venta): void {
    this.ventaSeleccionada = venta;
  }

  filtrar(): void {
    this._aplicarFiltrosYPaginar(0);
  }

  onTextoBusquedaChange(): void {
    this._aplicarFiltrosYPaginar(0);
  }

  irAPagina(pagina: number): void {
    if (pagina < 0 || pagina >= this.totalPages) return;
    this._aplicarFiltrosYPaginar(pagina);
  }

  limpiarFiltros(): void {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.textoBusqueda = '';
    this._aplicarFiltrosYPaginar(0);
  }
  calcularComisionHoy(): number {
    return this.ventasFiltradas.reduce((acc, v) => acc + (v.comisionGenerada || 0), 0);
  }

  calcularTotalHoy(): number {
    return this.ventasFiltradas.reduce((acc, v) => acc + (v.monto || 0), 0);
  }

  private _aplicarFiltrosYPaginar(pagina: number): void {
    let resultado = [...this._todos];

    if (this.fechaInicio && this.fechaFin) {
      resultado = resultado.filter(
        v => v.fechaVenta >= this.fechaInicio && v.fechaVenta <= this.fechaFin
      );
    }

    const texto = this.textoBusqueda.trim().toLowerCase();
    if (texto) {
      resultado = resultado.filter(v =>
        v.codigoVenta?.toLowerCase().includes(texto) ||
        v.clienteNombre?.toLowerCase().includes(texto) ||
        v.campanaNombre?.toLowerCase().includes(texto) ||
        v.clienteDoc?.toLowerCase().includes(texto) 
      );
    }

    this.ventasFiltradas = resultado;
    this.paginaActual = pagina;

    const inicio = pagina * this.PAGE_SIZE;
    this.ventasPagina = resultado.slice(inicio, inicio + this.PAGE_SIZE);
  }
}