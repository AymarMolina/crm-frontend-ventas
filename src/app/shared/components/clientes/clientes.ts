import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Cliente, ClienteRequest, PageResponse } from '../../../core/models/crm.models';
import { ClientesService } from '../../../core/services/clientes.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-clientes',
  imports: [FormsModule,CommonModule,ReactiveFormsModule],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
})
export class Clientes implements OnInit {
 
  // ── Estado de la tabla ──────────────────────────────────────────────────────
  clientes: Cliente[] = [];
  loading = false;
  busqueda = '';
  currentPage = 0;
  pageSize = 20;
  totalPages = 0;
 
  private buscarSubject = new Subject<string>();
 
  // ── Estado del modal ────────────────────────────────────────────────────────
  showModal = false;
  modoEdicion = false;
  saving = false;
  errorMsg = '';
  selectedId: string | null = null;
 
  // ── Estado del modal de eliminación ────────────────────────────────────────
  showDeleteConfirm = false;
  deleteId: string | null = null;
 
  // ── Formulario ──────────────────────────────────────────────────────────────
  clienteForm: FormGroup;
 
  constructor(
    private clientesService: ClientesService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {
    this.clienteForm = this.fb.group({
      tipoDoc:      ['DNI', Validators.required],
      nroDoc:       ['', Validators.required],
      nombre:       ['', Validators.required],
      apellidoP:    ['', Validators.required],
      apellidoM:    [''],
      email:        ['', [Validators.email]],
      telefono:     [''],
      telefonoAlt:  [''],
      direccion:    [''],
      departamento: [''],
      provincia:    [''],
      distrito:     [''],
    });
  }
 
  ngOnInit(): void {
    this.listarClientes();
 
    // Debounce para el buscador: espera 400ms antes de llamar a la API
    this.buscarSubject.pipe(debounceTime(400)).subscribe((q) => {
      this.currentPage = 0;
      this.listarClientes(q);
      this.cdr.detectChanges();
    });
  }
 
  // ── CRUD: Listar ────────────────────────────────────────────────────────────
  listarClientes(q?: string): void {
    this.loading = true;
    this.clientesService.listar(q || this.busqueda || undefined, this.currentPage, this.pageSize).subscribe({
      next: (res: PageResponse<Cliente>) => {
        this.clientes    = res.content;
        this.totalPages  = res.totalPages ?? 0;
        this.loading     = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
 
  onBuscar(): void {
    this.buscarSubject.next(this.busqueda);
    this.cdr.detectChanges();
  }
 
  cambiarPagina(page: number): void {
    this.currentPage = page;
    this.listarClientes();
    this.cdr.detectChanges();
  }
 
  // ── CRUD: Abrir modal Crear ─────────────────────────────────────────────────
  abrirCrear(): void {
    this.modoEdicion = false;
    this.selectedId  = null;
    this.errorMsg    = '';
    this.clienteForm.reset({ tipoDoc: 'DNI' });
    this.clienteForm.get('nroDoc')?.enable();
    this.showModal = true;
  }
 
  // ── CRUD: Abrir modal Editar ────────────────────────────────────────────────
  abrirEditar(cliente: Cliente): void {
    this.modoEdicion = true;
    this.selectedId  = cliente.id;
    this.errorMsg    = '';
    this.showModal   = true;
 
    // Bloqueamos nroDoc en edición para no cambiar el documento
    this.clienteForm.get('nroDoc')?.disable();
 
    this.clienteForm.patchValue({
      tipoDoc:      cliente.tipoDoc,
      nroDoc:       cliente.nroDoc,
      nombre:       cliente.nombre,
      apellidoP:    cliente.apellidoP,
      apellidoM:    cliente.apellidoM   ?? '',
      email:        cliente.email       ?? '',
      telefono:     cliente.telefono    ?? '',
      telefonoAlt:  cliente.telefonoAlt ?? '',
      direccion:    cliente.direccion   ?? '',
      departamento: cliente.departamento ?? '',
      provincia:    cliente.provincia   ?? '',
      distrito:     cliente.distrito    ?? '',
    });
  }
 
  // ── CRUD: Guardar (Crear o Actualizar) ──────────────────────────────────────
  guardarCambios(): void {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      return;
    }
 
    this.saving   = true;
    this.errorMsg = '';
 
    // getRawValue incluye campos disabled (nroDoc en edición)
    const body: ClienteRequest = this.clienteForm.getRawValue();
 
    if (this.modoEdicion && this.selectedId) {
      this.clientesService.actualizar(this.selectedId, body).subscribe({
        next: () => {
          this.saving = false;
          this.cerrarModal();
          this.listarClientes();
        },
        error: (err) => {
          this.saving   = false;
          this.errorMsg = err?.error?.message ?? 'Error al actualizar el cliente.';
        }
      });
    } else {
      this.clientesService.crear(body).subscribe({
        next: () => {
          this.saving = false;
          this.cerrarModal();
          this.listarClientes();
        },
        error: (err) => {
          this.saving   = false;
          this.errorMsg = err?.error?.message ?? 'Error al crear el cliente.';
        }
      });
    }
  }
 
  // ── CRUD: Eliminar (con confirmación) ───────────────────────────────────────
  eliminar(id: string): void {
    this.deleteId         = id;
    this.showDeleteConfirm = true;
  }
 
  confirmarEliminar(): void {
    if (!this.deleteId) return;
    this.saving = true;
    this.clientesService.eliminar(this.deleteId).subscribe({
      next: () => {
        this.saving           = false;
        this.showDeleteConfirm = false;
        this.deleteId         = null;
        this.listarClientes();
      },
      error: () => {
        this.saving = false;
      }
    });
  }
 
  cancelarEliminar(): void {
    this.showDeleteConfirm = false;
    this.deleteId         = null;
  }
 
  // ── Helpers ─────────────────────────────────────────────────────────────────
  cerrarModal(): void {
    this.showModal   = false;
    this.selectedId  = null;
    this.modoEdicion = false;
    this.errorMsg    = '';
    this.clienteForm.reset({ tipoDoc: 'DNI' });
    this.clienteForm.get('nroDoc')?.enable();
  }
 
  onOverlayClick(event: MouseEvent): void {
    // Cierra el modal si el clic fue en el overlay (no en el contenido)
    this.cerrarModal();
  }
 
  isInvalid(field: string): boolean {
    const ctrl = this.clienteForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }
}
 