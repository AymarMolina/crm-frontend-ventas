import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageResponse, Venta } from '../../../core/models/crm.models';
import { VentasService } from '../../../core/services/ventas.service';
import { AuthService } from '../../../core/services/auth.service';
import { VentaForm } from "../venta-form/venta-form";

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, VentaForm],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
  
  showModal = false;


  abrirModalVenta() {
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
  }

  finalizarVenta(ventaGenerada: any) {
    console.log('Venta exitosa:', ventaGenerada);
    this.cerrarModal();
  }
}