import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Campana, ClienteRequest } from '../../../core/models/crm.models';
import { ClientesService } from '../../../core/services/clientes.service';
import { VentasService } from '../../../core/services/ventas.service';
import { CampanasService } from '../../../core/services/campanas.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-venta-form',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './venta-form.html',
  styleUrl: './venta-form.css',
})
export class VentaForm implements OnInit {
  @Input() isModal = false;
  @Output() onSave = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<void>();

  ventaForm: FormGroup;
  campanas: Campana[] = [];
  loadingCliente = false;
  submitting = false;
  esClienteNuevo = false;

  constructor(
    private fb: FormBuilder,
    private ventasService: VentasService,
    private clientesService: ClientesService,
    private campanasService: CampanasService,
    private cdr: ChangeDetectorRef,
  ) {
    this.ventaForm = this.fb.group({
      tipoDoc: ['DNI', Validators.required],
      nroDoc: ['', [Validators.required, Validators.minLength(8)]],
      clienteId: [null, Validators.required], 
      nombreCompleto: [{ value: '', disabled: true }], 
      email:      [{ value: '', disabled: true }],
      telefono:   [{ value: '', disabled: true }],
      telefonoAlt:[{ value: '', disabled: true }],
      direccion:  [{ value: '', disabled: true }],
      distrito:   [{ value: '', disabled: true }],
      
      campanaId: ['', Validators.required],
      monto: [null, [Validators.required, Validators.min(0)]],
      fechaVenta: [new Date().toISOString().split('T')[0], Validators.required],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.cargarCampanas();
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

  buscarCliente() {
    const { tipoDoc, nroDoc } = this.ventaForm.getRawValue();

    if (!nroDoc || this.loadingCliente) return;
    this.loadingCliente = true;

    this.clientesService.buscarPorDocumento(tipoDoc, nroDoc).subscribe({
      next: (cliente) => {
        if (cliente) {
          // Al encontrar al cliente, inyectamos el ID en el form
          this.ventaForm.patchValue({
            clienteId: cliente.id, // <--- Este ID es el que usará enviarVenta
            nombreCompleto: cliente.nombreCompleto,
            email: cliente.email,
            telefono: cliente.telefono,
            telefonoAlt: cliente.telefonoAlt,
            direccion: cliente.direccion,
            distrito: cliente.distrito,
          });
          this.esClienteNuevo = false; // Por seguridad, si lo encuentra, no es nuevo
        } else {
          // Si no lo encuentra, podrías sugerir activar "Cliente Nuevo"
          console.warn('Cliente no encontrado');
          this.ventaForm.get('clienteId')?.setValue(null);
        }
        this.loadingCliente = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingCliente = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleClienteNuevo() {
    this.esClienteNuevo = !this.esClienteNuevo;
    
    const campos = ['nombreCompleto', 'email', 'telefono', 'telefonoAlt', 'direccion', 'distrito'];
    
    if (this.esClienteNuevo) {
      // Habilitar campos y limpiar ID para que el formulario sea editable
      campos.forEach(c => this.ventaForm.get(c)?.enable());
      this.ventaForm.get('clienteId')?.setValue(null);
      this.ventaForm.get('clienteId')?.clearValidators(); // Ya no es obligatorio un ID existente
    } else {
      // Deshabilitar y resetear
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
      // PASO 1: Crear el cliente primero
      const nuevoCliente: any = {
        tipoDoc: rawValue.tipoDoc,
        nroDoc: rawValue.nroDoc,
        nombre: rawValue.nombreCompleto.split(' ')[0], // Lógica simple de split
        apellidos: rawValue.nombreCompleto.split(' ').slice(1).join(' '),
        email: rawValue.email,
        telefono: rawValue.telefono,
        telefonoAlt: rawValue.telefonoAlt,
        direccion: rawValue.direccion,
        distrito: rawValue.distrito
      };

      this.clientesService.crearCliente(nuevoCliente).subscribe({
        next: (clienteCreado) => {
          // PASO 2: Usar el ID generado para la venta
          this.enviarVenta(clienteCreado.id, rawValue);
        },
        error: (err) => {
          console.error('Error al crear cliente:', err);
          this.submitting = false;
        }
      });
    } else {
      // Cliente existente, usamos el ID del formulario
      this.enviarVenta(rawValue.clienteId, rawValue);
    }
  }

  private enviarVenta(clienteId: string, formValues: any) {
    const payloadVenta = {
      campanaId: formValues.campanaId,
      clienteId: clienteId,
      fechaVenta: formValues.fechaVenta,
      monto: formValues.monto,
      observaciones: formValues.observaciones
    };

    this.ventasService.guardarVenta(payloadVenta).subscribe({
      next: (res) => {
        this.onSave.emit(res);
        this.submitting = false;
      },
      error: (err) => {
        console.error('Error al guardar venta:', err);
        this.submitting = false;
      }
    });
  }
}