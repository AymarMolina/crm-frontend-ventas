import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Campana, Producto } from '../../../core/models/crm.models';
import { ClientesService } from '../../../core/services/clientes.service';
import { VentasService } from '../../../core/services/ventas.service';
import { CampanasService } from '../../../core/services/campanas.service';
import { CommonModule } from '@angular/common';
import { ProductosService } from '../../../core/services/Productos.service';

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
      tipoDoc:       ['DNI', Validators.required],
      nroDoc:        ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      clienteId:     [null, Validators.required],
      nombre:        [{ value: '', disabled: true }, [Validators.required, Validators.minLength(2)]],
      apellidoP:     [{ value: '', disabled: true }, [Validators.required, Validators.minLength(2)]],
      apellidoM:     [{ value: '', disabled: true }],
      email:         [{ value: '', disabled: true }, [Validators.email]],
      telefono:      [{ value: '', disabled: true }, [Validators.pattern(/^9\d{8}$/)]],
      telefonoAlt:   [{ value: '', disabled: true }, [Validators.pattern(/^9\d{8}$/)]],
      direccion:     [{ value: '', disabled: true }],
      distrito:      [{ value: '', disabled: true }],
      campanaId:     ['', Validators.required],
      productoId:    [null],
      monto:         [null, [Validators.required, Validators.min(0.01)]],
      fechaVenta:    [new Date().toISOString().split('T')[0], Validators.required],
      observaciones: ['', Validators.maxLength(500)]
    });
  }

  ngOnInit(): void {
    this.cargarCampanas();

    this.ventaForm.get('tipoDoc')?.valueChanges.subscribe(tipo => {
      this.actualizarValidacionDoc(tipo);
    });

    this.ventaForm.get('campanaId')?.valueChanges.subscribe(campanaId => {
      this.onCampanaChange(campanaId);
    });

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

  actualizarValidacionDoc(tipo: string) {
    const nroDoc = this.ventaForm.get('nroDoc');
    switch (tipo) {
      case 'DNI':
        nroDoc?.setValidators([Validators.required, Validators.pattern(/^\d{8}$/)]);
        break;
      case 'RUC':
        nroDoc?.setValidators([Validators.required, Validators.pattern(/^\d{11}$/)]);
        break;
      case 'CE':
        nroDoc?.setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(12)]);
        break;
      case 'PASAPORTE':
        nroDoc?.setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(20)]);
        break;
    }
    nroDoc?.reset('');
    nroDoc?.updateValueAndValidity();
  }

  get placeholderDoc(): string {
    const tipo = this.ventaForm.get('tipoDoc')?.value;
    switch (tipo) {
      case 'DNI':       return 'Ej. 74385427 (8 dígitos)';
      case 'RUC':       return 'Ej. 20123456789 (11 dígitos)';
      case 'CE':        return 'Ej. 000123456 (6-12 caracteres)';
      case 'PASAPORTE': return 'Ej. AB123456 (6-20 caracteres)';
      default:          return 'Número de documento';
    }
  }

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
            clienteId:   cliente.id,
            nombre:      cliente.nombre,
            apellidoP:   cliente.apellidoP,
            apellidoM:   cliente.apellidoM,
            email:       cliente.email,
            telefono:    cliente.telefono,
            telefonoAlt: cliente.telefonoAlt,
            direccion:   cliente.direccion,
            distrito:    cliente.distrito,
          });
          this.esClienteNuevo = false;
        } else {
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
    const campos = ['nombre', 'apellidoP', 'apellidoM', 'email', 'telefono', 'telefonoAlt', 'direccion', 'distrito'];

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
    const nombre = this.ventaForm.get('nombre')?.value as string ?? '';
    const partes = nombre.trim().split(' ');
    return partes.length >= 2
      ? (partes[0][0] + partes[1][0]).toUpperCase()
      : nombre.slice(0, 2).toUpperCase();
  }

  guardarVenta() {
    if (this.ventaForm.invalid) {
      this.ventaForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const rawValue = this.ventaForm.getRawValue();

    if (this.esClienteNuevo) {
      const nuevoCliente: any = {
        tipoDoc:     rawValue.tipoDoc,
        nroDoc:      rawValue.nroDoc,
        nombre:      rawValue.nombre,
        apellidoP:   rawValue.apellidoP,
        apellidoM:   rawValue.apellidoM,
        email:       rawValue.email,
        telefono:    rawValue.telefono,
        telefonoAlt: rawValue.telefonoAlt,
        direccion:   rawValue.direccion,
        distrito:    rawValue.distrito
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
      productoId:   formValues.productoId || null,
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

  getError(campo: string): string {
    const control = this.ventaForm.get(campo);
    if (!control || !control.invalid || !control.touched) return '';

    if (control.hasError('required'))  return 'Este campo es obligatorio';
    if (control.hasError('email'))     return 'Ingresa un correo válido (ej. nombre@correo.com)';
    if (control.hasError('min'))       return 'El monto debe ser mayor a 0';
    if (control.hasError('maxlength')) return `Máximo ${control.errors?.['maxlength'].requiredLength} caracteres`;
    if (control.hasError('minlength')) return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;

    if (control.hasError('pattern')) {
      if (campo === 'telefono' || campo === 'telefonoAlt')
        return 'Debe ser un celular peruano (9 dígitos, empieza en 9)';
      if (campo === 'nroDoc') {
        const tipo = this.ventaForm.get('tipoDoc')?.value;
        if (tipo === 'DNI') return 'El DNI debe tener exactamente 8 dígitos';
        if (tipo === 'RUC') return 'El RUC debe tener exactamente 11 dígitos';
        return 'Formato de documento inválido';
      }
    }
    return '';
  }
}