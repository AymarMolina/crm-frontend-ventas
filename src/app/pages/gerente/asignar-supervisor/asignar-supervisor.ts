import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Asesor, AsesorService } from '../../../core/services/asesor.service';
import { Supervisor, SupervisorService } from '../../../core/services/supervisor.service';
import { GerenteService } from '../../../core/services/gerente.service';
import { forkJoin, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-asignar-supervisor',
  imports: [FormsModule, CommonModule],
  templateUrl: './asignar-supervisor.html',
  styleUrl: './asignar-supervisor.css',
})
export class AsignarSupervisor implements OnInit, OnDestroy {
  loading   = true;
  guardando = false;
  error     = '';
  exito     = false;

  asesores:    Asesor[]      = [];
  supervisores: Supervisor[] = [];

  form = { agenteId: '', supervisorId: '' };

  private subs = new Subscription();

  constructor(
    private asesorService:     AsesorService,
    private supervisorService: SupervisorService,
    private gerenteService:    GerenteService,
    private cdr:               ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private cargarDatos(): void {
    this.loading = true;
    this.error   = '';

    const sub = forkJoin({
      asesores:     this.asesorService.listarAsesores(),
      supervisores: this.supervisorService.listarSupervisores(),
    }).subscribe({
      next: ({ asesores, supervisores }) => {
        this.asesores     = asesores;
        this.supervisores = supervisores;
        this.loading      = false;
        this.cdr.detectChanges(); // ✅
      },
      error: () => {
        this.error   = 'No se pudieron cargar los datos. Intenta de nuevo.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });

    this.subs.add(sub);
  }

  // ✅ Método separado solo para refrescar la tabla
  private refrescarAsesores(): void {
    const sub = this.asesorService.listarAsesores().subscribe({
      next: (data) => {
        this.asesores = [...data]; // ✅ spread fuerza nueva referencia → Angular detecta el cambio
        this.cdr.detectChanges();  // ✅ detectChanges DENTRO del subscribe
      },
      error: () => this.cdr.detectChanges()
    });
    this.subs.add(sub);
  }

  get formValido(): boolean {
    return !!this.form.agenteId && !!this.form.supervisorId;
  }

  get asesorSeleccionado(): Asesor | undefined {
    return this.asesores.find(a => a.id === this.form.agenteId);
  }

  guardar(): void {
    if (!this.formValido) return;

    this.guardando = true;
    this.error     = '';
    this.exito     = false;

    const sub = this.gerenteService.designarSupervisor({
      agenteId:    this.form.agenteId,
      supervisorId: this.form.supervisorId,
    }).subscribe({
      next: () => {
        this.exito     = true;
        this.guardando = false;
        this.form      = { agenteId: '', supervisorId: '' };
        this.refrescarAsesores();
      },
      error: () => {
        this.error     = 'Ocurrió un error al designar el supervisor. Intenta de nuevo.';
        this.guardando = false;
        this.cdr.detectChanges();
      },
    });

    this.subs.add(sub);
  }

  limpiar(): void {
    this.form  = { agenteId: '', supervisorId: '' };
    this.error = '';
    this.exito = false;
  }
}