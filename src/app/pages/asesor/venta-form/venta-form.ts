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
      observaciones: [''],
      codigoVenta: [`VTA-${new Date().getFullYear()}-000`] 
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

    // Limpiar datos anteriores
    this.ventaForm.patchValue({
      clienteId: null,
      nombreCompleto: '',
      email: '',
      telefono: '',
      telefonoAlt: '',
      direccion: '',
      distrito: '',
    });

    this.clientesService.buscarPorDocumento(tipoDoc, nroDoc).subscribe({
      next: (cliente) => {
        if (cliente) {
          this.ventaForm.patchValue({
            clienteId:      cliente.id,
            nombreCompleto: cliente.nombreCompleto,
            email:          cliente.email,
            telefono:       cliente.telefono,
            telefonoAlt:    cliente.telefonoAlt,
            direccion:      cliente.direccion,
            distrito:       cliente.distrito,
          });
        } else {
          console.warn('Cliente no encontrado');
        }
        this.loadingCliente = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.loadingCliente = false;
      }
    });
  }

  toggleClienteNuevo() {
    this.esClienteNuevo = !this.esClienteNuevo;
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
    const payload = this.ventaForm.getRawValue(); 

    this.ventasService.guardarVenta(payload).subscribe({
      next: (res) => {
        this.onSave.emit(res);
        this.submitting = false;
      },
      error: () => this.submitting = false
    });
  }
}