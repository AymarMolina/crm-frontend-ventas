import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActualizarUsuarioRequest, CrearUsuarioRequest, RolCodigo, UsuarioResponse, UsuarioService } from '../../../core/services/usuario.service';

type ModalMode = 'crear' | 'editar' | 'detalle' | 'eliminar' | 'eliminados' | null;

interface UsuarioForm {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  rolCodigo: RolCodigo | '';
}

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-usuarios.html',
})
export class GestionUsuarios implements OnInit {
  usuarios: UsuarioResponse[] = [];
  usuariosFiltrados: UsuarioResponse[] = [];

  loading = true;
  guardando = false;
  error = '';
  exito = '';

  modalMode: ModalMode = null;
  usuarioSeleccionado: UsuarioResponse | null = null;

  busqueda = '';
  filtroRol: RolCodigo | '' = '';

  roles: { codigo: RolCodigo; label: string; color: string }[] = [
    { codigo: 'GERENTE',     label: 'Gerente',     color: 'indigo' },
    { codigo: 'SUPERVISOR',  label: 'Supervisor',  color: 'violet' },
    { codigo: 'BACK_OFFICE', label: 'Back Office', color: 'amber' },
    { codigo: 'AGENTE',      label: 'Asesor',      color: 'emerald' },
  ];

  form: UsuarioForm = this.formVacio();

  constructor(private usuarioService: UsuarioService,private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarEliminados()
  }

  cargarUsuarios(): void {
    this.loading = true;
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.aplicarFiltros();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar los usuarios.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
  vistaEliminados = false;        
  usuariosEliminados: any[] = [];
  cargandoEliminados = false;
  aplicarFiltros(): void {
      const q = this.busqueda.toLowerCase().trim();
      this.usuariosFiltrados = this.usuarios.filter((u) => {
          if (!u.activo) return false;  
          const matchBusqueda =
              !q ||
              `${u.nombres} ${u.apellidos}`.toLowerCase().includes(q) ||
              u.email.toLowerCase().includes(q);
          const matchRol = !this.filtroRol || u.rolCodigo === this.filtroRol;
          return matchBusqueda && matchRol;
      });
  }
  toggleVistaEliminados(): void {
      this.vistaEliminados = !this.vistaEliminados;
      if (this.vistaEliminados && this.usuariosEliminados.length === 0) {
          this.cargarEliminados();
          this.cdr.detectChanges();
      }
  }

  cargarEliminados(): void {
      this.cargandoEliminados = true;
      this.usuarioService.getUsuariosEliminados().subscribe({
          next: (data) => {
              this.usuariosEliminados = data;
              this.cargandoEliminados = false;
              this.cdr.detectChanges();
          },
          error: () => {
              this.error = 'Error al cargar usuarios eliminados.';
              this.cargandoEliminados = false;
          }
      });
  }

  diasRestantes(eliminadoEn: string): number {
      const diff = new Date(eliminadoEn).getTime() + (30 * 24 * 60 * 60 * 1000) - Date.now();
      return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  abrirEliminados(): void {
      this.modalMode = 'eliminados';
      this.cargarEliminados(); // siempre refresca al abrir
  }
  reactivar(id: string): void {
      this.usuarioService.reactivarUsuario(id).subscribe({
          next: () => {
              this.usuariosEliminados = this.usuariosEliminados.filter(u => u.id !== id);
              this.cargarUsuarios();
              if (this.usuariosEliminados.length === 0) this.cerrarModal();
              this.cdr.detectChanges();
          },
          error: (err) => {
              this.error = err?.error?.message ?? 'Error al reactivar.';
          }
      });
  }
  // ── Modal helpers ──────────────────────────────────────────────

  abrirCrear(): void {
    this.form = this.formVacio();
    this.limpiarAlertas();
    this.modalMode = 'crear';
  }

  abrirEditar(u: UsuarioResponse): void {
    this.usuarioSeleccionado = u;
    this.form = {
      nombres: u.nombres,
      apellidos: u.apellidos,
      email: u.email,
      password: '',
      rolCodigo: u.rolCodigo,
    };
    this.limpiarAlertas();
    this.modalMode = 'editar';
  }

  abrirDetalle(u: UsuarioResponse): void {
    this.usuarioSeleccionado = u;
    this.modalMode = 'detalle';
  }

  abrirEliminar(u: UsuarioResponse): void {
    this.usuarioSeleccionado = u;
    this.limpiarAlertas();
    this.modalMode = 'eliminar';
  }

  cerrarModal(): void {
    this.modalMode = null;
    this.usuarioSeleccionado = null;
    this.limpiarAlertas();
  }

  // ── CRUD ───────────────────────────────────────────────────────

  guardar(): void {
    if (!this.formValido) return;
    this.guardando = true;
    this.limpiarAlertas();

    if (this.modalMode === 'crear') {
      const payload: CrearUsuarioRequest = {
        nombres: this.form.nombres,
        apellidos: this.form.apellidos,
        email: this.form.email,
        password: this.form.password,
        rolCodigo: this.form.rolCodigo as RolCodigo,
      };
      this.usuarioService.crearUsuario(payload).subscribe({
        next: () => {
          this.exito = 'Usuario creado correctamente.';
          this.guardando = false;
          this.cargarUsuarios();
          setTimeout(() => this.cerrarModal(), 1200);
        },
        error: (err) => {
          this.error = err?.error?.message ?? 'Error al crear el usuario.';
          this.guardando = false;
        },
      });
    } else if (this.modalMode === 'editar' && this.usuarioSeleccionado) {
      const payload: ActualizarUsuarioRequest = {
        nombres: this.form.nombres,
        apellidos: this.form.apellidos,
        email: this.form.email,
        rolCodigo: this.form.rolCodigo as RolCodigo,
      };
      this.usuarioService.actualizarUsuario(this.usuarioSeleccionado.id, payload).subscribe({
        next: () => {
          this.exito = 'Usuario actualizado correctamente.';
          this.guardando = false;
          this.cargarUsuarios();
          setTimeout(() => this.cerrarModal(), 1200);
        },
        error: (err) => {
          this.error = err?.error?.message ?? 'Error al actualizar el usuario.';
          this.guardando = false;
        },
      });
    }
  }

  confirmarEliminar(): void {
    if (!this.usuarioSeleccionado) return;
    this.guardando = true;
    this.usuarioService.eliminarUsuario(this.usuarioSeleccionado.id).subscribe({
      next: () => {
        this.guardando = false;
        this.cargarUsuarios();
        this.cerrarModal();
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Error al eliminar el usuario.';
        this.guardando = false;
      },
    });
  }

  // ── Helpers ────────────────────────────────────────────────────

  get formValido(): boolean {
    const f = this.form;
    const baseOk = !!f.nombres.trim() && !!f.apellidos.trim() && !!f.email.trim() && !!f.rolCodigo;
    if (this.modalMode === 'crear') return baseOk && !!f.password.trim();
    return baseOk;
  }

  rolLabel(codigo: RolCodigo): string {
    return this.roles.find((r) => r.codigo === codigo)?.label ?? codigo;
  }

  rolColor(codigo: RolCodigo): string {
    return this.roles.find((r) => r.codigo === codigo)?.color ?? 'slate';
  }

  badgeClasses(codigo: RolCodigo): string {
    const map: Record<string, string> = {
      indigo:  'bg-indigo-100 text-indigo-700',
      violet:  'bg-violet-100 text-violet-700',
      amber:   'bg-amber-100 text-amber-700',
      emerald: 'bg-emerald-100 text-emerald-700',
      slate:   'bg-slate-100 text-slate-500',
    };
    return map[this.rolColor(codigo)] ?? map['slate'];
  }

  iniciales(u: UsuarioResponse): string {
    return `${u.nombres[0] ?? ''}${u.apellidos[0] ?? ''}`.toUpperCase();
  }

  avatarBg(codigo: RolCodigo): string {
    const map: Record<string, string> = {
      indigo:  'bg-indigo-100 text-indigo-600',
      violet:  'bg-violet-100 text-violet-600',
      amber:   'bg-amber-100 text-amber-700',
      emerald: 'bg-emerald-100 text-emerald-700',
      slate:   'bg-slate-100 text-slate-500',
    };
    return map[this.rolColor(codigo)] ?? map['slate'];
  }

  private formVacio(): UsuarioForm {
    return { nombres: '', apellidos: '', email: '', password: '', rolCodigo: '' };
  }

  private limpiarAlertas(): void {
    this.error = '';
    this.exito = '';
  }
}