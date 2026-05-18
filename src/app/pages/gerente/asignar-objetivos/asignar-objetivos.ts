import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CrearObjetivoRequest, ObjetivoService } from '../../../core/services/objetivo.service';
import { CampanasService } from '../../../core/services/campanas.service';
import { forkJoin } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface Supervisor {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
}

@Component({
  selector: 'app-asignar-objetivos',
  imports: [ReactiveFormsModule,CommonModule,FormsModule],
  templateUrl: './asignar-objetivos.html',
  styleUrl: './asignar-objetivos.css',
})
export class AsignarObjetivos implements OnInit {
 
  supervisores: Supervisor[] = [];
  campanas: any[] = [];
 
  form: CrearObjetivoRequest = {
    campanaId: '',
    usuarioId: '',
    objetivoVentas: 0,
    montoComision: 0
  };
 
  objetivoExistenteId: number | null = null;
  modoEdicion = false;
  buscandoObjetivo = false;
 
  loading = true;
  guardando = false;
  exito = false;
  error = '';
 
  constructor(
    private objetivoService: ObjetivoService,
    private campanaService: CampanasService,
    private cdr: ChangeDetectorRef
  ) {}
 
  ngOnInit(): void {
    setTimeout(() => this.cargarDatos(), 100);
  }
 
  cargarDatos(): void {
    this.loading = true;
    this.error = '';
 
    forkJoin({
      supervisores: this.objetivoService.getSupervisores(),
      campanas: this.campanaService.listarCampanas()
    }).subscribe({
      next: (res) => {
        this.supervisores = res.supervisores;
        this.campanas = res.campanas;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al cargar la información inicial.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
 
  onSeleccionCambia(): void {
    this.objetivoExistenteId = null;
    this.modoEdicion = false;
    this.error = '';
    this.exito = false;
 
    const { usuarioId, campanaId } = this.form;
    if (!usuarioId || !campanaId) return;
 
    this.buscandoObjetivo = true;
 
    this.objetivoService.buscarObjetivo(usuarioId, campanaId).subscribe({
      next: (objetivo) => {
        this.buscandoObjetivo = false;
        if (objetivo) {
          this.objetivoExistenteId = objetivo.id;
          this.form.objetivoVentas = objetivo.objetivoVentas;
          this.form.montoComision = Number(objetivo.montoComision);
          this.modoEdicion = true;
        } else {
          this.form.objetivoVentas = 0;
          this.form.montoComision = 0;
          this.modoEdicion = false;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.buscandoObjetivo = false;
        this.cdr.detectChanges();
      }
    });
  }
 
  guardar(): void {
    if (!this.form.campanaId || !this.form.usuarioId || this.form.objetivoVentas <= 0) {
      this.error = 'Completa todos los campos requeridos.';
      return;
    }
 
    this.guardando = true;
    this.error = '';
    this.exito = false;
 
    const operacion$ = this.modoEdicion && this.objetivoExistenteId
      ? this.objetivoService.actualizarObjetivo(this.objetivoExistenteId, this.form)
      : this.objetivoService.crearObjetivo(this.form);
 
    operacion$.subscribe({
      next: () => {
        this.exito = true;
        this.guardando = false;
        this.modoEdicion = false;
        this.objetivoExistenteId = null;
        this.form = { campanaId: '', usuarioId: '', objetivoVentas: 0, montoComision: 0 };
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.guardando = false;
        this.error = err.error?.message ?? 'Error al guardar el objetivo.';
        this.cdr.detectChanges();
      }
    });
  }
}
