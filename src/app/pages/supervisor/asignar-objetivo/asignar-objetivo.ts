import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AgenteEquipo, CrearObjetivoRequest, ObjetivoService } from '../../../core/services/objetivo.service';
import { CampanasService } from '../../../core/services/campanas.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs'; // Asegúrate de importar esto
@Component({
  selector: 'app-asignar-objetivo',
  imports: [CommonModule,FormsModule],
  templateUrl: './asignar-objetivo.html',
  styleUrl: './asignar-objetivo.css',
})
export class AsignarObjetivo  implements OnInit {

  agentes: AgenteEquipo[] = [];
  campanas: any[] = [];

  form: CrearObjetivoRequest = {
    campanaId: '',
    usuarioId: '',
    objetivoVentas: 0,
    montoComision: 0
  };

  loading = true;
  guardando = false;
  exito = false;
  error = '';
  ngOnInit(): void {
    // Un pequeño delay asegura que el AuthGuard y el Token ya estén listos en el navegador
    setTimeout(() => {
      this.cargarDatos();
    }, 100);
  }
  constructor(
    private objetivoService: ObjetivoService,
    private campanaService: CampanasService,
    private cdr: ChangeDetectorRef // 2. Inyéctalo aquí
  ) {}

  cargarDatos(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      agentes: this.objetivoService.getMiEquipo(),
      campanas: this.campanaService.listarCampanas()
    }).subscribe({
      next: (res) => {
        this.agentes = res.agentes;
        this.campanas = res.campanas;
        this.loading = false; 
        
        // 3. Forzar la actualización de la interfaz
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al cargar la información inicial.';
        this.loading = false;
        this.cdr.detectChanges(); // También en caso de error
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

    this.objetivoService.crearObjetivo(this.form).subscribe({
      next: () => {
        this.exito = true;
        this.guardando = false;
        this.form = { campanaId: '', usuarioId: '', objetivoVentas: 0, montoComision: 0 };
      },
      error: (err) => {
        this.guardando = false;
        this.error = err.error?.message ?? 'Error al guardar el objetivo.';
      }
    });
  }
}