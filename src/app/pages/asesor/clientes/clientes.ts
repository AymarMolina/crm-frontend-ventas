import { Component, OnInit } from '@angular/core';
import { Cliente, PageResponse } from '../../../core/models/crm.models';
import { ClientesService } from '../../../core/services/clientes.service';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clientes',
  imports: [FormsModule,CommonModule],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
})
export class Clientes implements OnInit {
  clientes: Cliente[] = [];
  loading = false;
  showModal = false;
  clienteForm: FormGroup;
  selectedId: string | null = null;

  constructor(
    private clientesService: ClientesService,
    private fb: FormBuilder
  ) {
    // Definimos el formulario con los campos que mencionaste
    this.clienteForm = this.fb.group({
      tipoDoc: ['DNI', Validators.required],
      nroDoc: ['', Validators.required],
      nombre: ['', Validators.required],
      apellidoP: ['', Validators.required],
      apellidoM: [''],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      direccion: ['', Validators.required],
      departamento: [''],
      provincia: [''],
      distrito: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.listarClientes();
  }

  listarClientes() {
    this.loading = true;
    this.clientesService.listar().subscribe({
      next: (res: PageResponse<Cliente>) => {
        this.clientes = res.content;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  abrirEditar(cliente: Cliente) {
    this.selectedId = cliente.id;
    this.showModal = true;
    // Parchamos los valores incluyendo los campos nuevos
    this.clienteForm.patchValue({
      ...cliente,
      // Si el objeto del backend tiene nombreCompleto pero el PUT pide apellidos separados, 
      // asegúrate de mapearlos correctamente si fuera necesario.
    });
  }

  guardarCambios() {
    if (this.clienteForm.invalid || !this.selectedId) return;

    const body = this.clienteForm.value;
    this.clientesService.actualizar(this.selectedId, body).subscribe({
      next: () => {
        this.cerrarModal();
        this.listarClientes(); // Refrescar tabla
      },
      error: (err) => console.error("Error al actualizar", err)
    });
  }

  eliminar(id: string) {
    if (confirm('¿Eliminar este cliente?')) {
      this.clientesService.eliminar(id).subscribe(() => this.listarClientes());
    }
  }

  cerrarModal() {
    this.showModal = false;
    this.selectedId = null;
    this.clienteForm.reset({ tipoDoc: 'DNI' });
  }
}