import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Campana, ClienteRequest, Producto } from '../../../core/models/crm.models';
import { ClientesService } from '../../../core/services/clientes.service';
import { VentasService } from '../../../core/services/ventas.service';
import { CampanasService } from '../../../core/services/campanas.service';
import { CommonModule } from '@angular/common';
import {  ProductosService } from '../../../core/services/Productos.service';

@Component({
  selector: 'app-venta-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './venta-form.html',
  styleUrl: './venta-form.css',
})
export class VentaForm implements OnInit {
  @Input() isModal = false;
  @Output() onSave = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<void>();

  ventaForm: FormGroup;
  campanas: Campana[] = [];
  productos: Producto[] = [];        
  loadingCliente = false;
  loadingProductos = false;          
  submitting = false;
  esClienteNuevo = false;

  constructor(
    private fb: FormBuilder,
    private ventasService: VentasService,
    private clientesService: ClientesService,
    private campanasService: CampanasService,
    private productosService: ProductosService,
    private cdr: ChangeDetectorRef,
  ) {
    this.ventaForm = this.fb.group({
      tipoDoc:        ['DNI', Validators.required],
      nroDoc:         ['', [Validators.required, Validators.minLength(8)]],
      clienteId:      [null, Validators.required],
      nombre: [{ value: '', disabled: true }],
      apellidoP: [{ value: '', disabled: true }],
      apellidoM: [{ value: '', disabled: true }],
      email:          [{ value: '', disabled: true }],
      telefono:       [{ value: '', disabled: true }],
      direccion:      [{ value: '', disabled: true }],
      distrito:       [{ value: '', disabled: true }],

      campanaId:      ['', Validators.required],
      productoId:     [null],                          // 👈 opcional por ahora
      monto:          [null, [Validators.required, Validators.min(0)]],
      fechaVenta:     [new Date().toISOString().split('T')[0], Validators.required],
      observaciones:  ['']
    });
  }

  ngOnInit(): void {
    this.cargarCampanas();

    // 👈 Escuchar cambio de campaña
    this.ventaForm.get('campanaId')?.valueChanges.subscribe(campanaId => {
      this.onCampanaChange(campanaId);
    });

    // 👈 Escuchar cambio de producto
    this.ventaForm.get('productoId')?.valueChanges.subscribe(productoId => {
      this.onProductoChange(productoId);
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

  // 👈 Al cambiar campaña: cargar productos y limpiar selección previa
  onCampanaChange(campanaId: string) {
    this.productos = [];
    this.ventaForm.get('productoId')?.setValue(null, { emitEvent: false });
    this.ventaForm.get('monto')?.setValue(null);

    if (!campanaId) return;

    this.loadingProductos = true;
    this.productosService.listarPorCampana(campanaId).subscribe({
      next: (lista) => {
        this.productos = lista;
        this.loadingProductos = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingProductos = false;
        this.cdr.detectChanges();
      }
    });
  }

  // 👈 Al elegir producto: autocompletar monto con precio
  onProductoChange(productoId: string) {
    if (!productoId) return;
    const producto = this.productos.find(p => p.id === productoId);
    if (producto) {
      this.ventaForm.get('monto')?.setValue(producto.precio);
    }
  }

  buscarCliente() {
    const { tipoDoc, nroDoc } = this.ventaForm.getRawValue();
    if (!nroDoc || this.loadingCliente) return;
    this.loadingCliente = true;

    this.clientesService.buscarPorDocumento(tipoDoc, nroDoc).subscribe({
      next: (cliente) => {
        if (cliente) {
          this.ventaForm.patchValue({
            clienteId:      cliente.id,
            nombre: cliente.nombre,
            apellidoP: cliente.apellidoP,
            apellidoM: cliente.apellidoM,
            email:          cliente.email,
            telefono:       cliente.telefono,
            telefonoAlt:    cliente.telefonoAlt,
            direccion:      cliente.direccion,
            distrito:       cliente.distrito,
          });
          this.esClienteNuevo = false;
        } else {
          console.warn('Cliente no encontrado');
          this.ventaForm.get('clienteId')?.setValue(null);
        }
        this.loadingCliente = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingCliente = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleClienteNuevo() {
    this.esClienteNuevo = !this.esClienteNuevo;
    const campos = ['nombre','apellidoP','apellidoM', 'email', 'telefono', 'telefonoAlt', 'direccion', 'distrito'];

    if (this.esClienteNuevo) {
      campos.forEach(c => this.ventaForm.get(c)?.enable());
      this.ventaForm.get('clienteId')?.setValue(null);
      this.ventaForm.get('clienteId')?.clearValidators();
    } else {
      campos.forEach(c => this.ventaForm.get(c)?.disable());
      this.ventaForm.get('clienteId')?.setValidators([Validators.required]);
    }
    this.ventaForm.get('clienteId')?.updateValueAndValidity();
  }

  get inicialesCliente(): string {
    const nombre = this.ventaForm.get('nombreCompleto')?.value as string ?? '';
    const partes = nombre.trim().split(' ');
    return partes.length >= 2
      ? (partes[0][0] + partes[1][0]).toUpperCase()
      : nombre.slice(0, 2).toUpperCase();
  }

  guardarVenta() {
    if (this.ventaForm.invalid) return;
    this.submitting = true;
    const rawValue = this.ventaForm.getRawValue();

    if (this.esClienteNuevo) {
      const nuevoCliente: any = {
        tipoDoc:    rawValue.tipoDoc,
        nroDoc:     rawValue.nroDoc,
        nombre:     rawValue.nombre,
        apellidoP:  rawValue.apellidoP,
        apellidoM:  rawValue.apellidoM,
        email:      rawValue.email,
        telefono:   rawValue.telefono,
        telefonoAlt: rawValue.telefonoAlt,
        direccion:  rawValue.direccion,
        distrito:   rawValue.distrito
      };

      this.clientesService.crearCliente(nuevoCliente).subscribe({
        next: (clienteCreado) => this.enviarVenta(clienteCreado.id, rawValue),
        error: () => { this.submitting = false; }
      });
    } else {
      this.enviarVenta(rawValue.clienteId, rawValue);
    }
  }

  private enviarVenta(clienteId: string, formValues: any) {
    const payloadVenta = {
      campanaId:    formValues.campanaId,
      productoId:   formValues.productoId || null,  // 👈
      clienteId:    clienteId,
      fechaVenta:   formValues.fechaVenta,
      monto:        formValues.monto,
      observaciones: formValues.observaciones
    };

    this.ventasService.guardarVenta(payloadVenta).subscribe({
      next: (res) => {
        this.onSave.emit(res);
        this.submitting = false;
      },
      error: () => { this.submitting = false; }
    });
  }
}