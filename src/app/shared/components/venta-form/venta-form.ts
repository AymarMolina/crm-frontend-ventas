import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Campana, Producto, Venta } from '../../../core/models/crm.models';
import { ClientesService } from '../../../core/services/clientes.service';
import { VentasService } from '../../../core/services/ventas.service';
import { CampanasService } from '../../../core/services/campanas.service';
import { CommonModule } from '@angular/common';
import { ProductosService } from '../../../core/services/Productos.service';
import { UbigeoService } from '../../../core/services/ubigeo.service';

@Component({
  selector: 'app-venta-form',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './venta-form.html',
  styleUrl: './venta-form.css',
})
export class VentaForm implements OnInit {
  @Input() ventaEditar: Venta | null = null;
  @Input() isModal = false;
  @Output() onSave = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<void>();
 
  formularioBloqueado = false;
  ventaForm: FormGroup;
  campanas: Campana[] = [];
  productos: Producto[] = [];
  loadingCliente = false;
  loadingProductos = false;
  submitting = false;
  esClienteNuevo = false;
  provinciaHabilitada = false;
  distritoHabilitado = false;
  departamentos: string[] = [];
  provincias: string[] = [];
  distritos: string[] = [];
  deptoFiltro = '';
  provFiltro = '';
  distFiltro = '';
 
  get departamentosFiltrados() {
    return this.departamentos.filter(d =>
      d?.toLowerCase().startsWith(this.deptoFiltro.toLowerCase())
    );
  }
  get provinciasFiltradas() {
    return this.provincias.filter(p =>
      p?.toLowerCase().startsWith(this.provFiltro.toLowerCase())
    );
  }
  get distritosFiltrados() {
    return this.distritos.filter(d =>
      d?.toLowerCase().startsWith(this.distFiltro.toLowerCase())
    );
  }
  deptoOpen = false;
  provOpen = false;
  distOpen = false;
  seleccionarDepto(d: string) {
    this.ventaForm.get('departamento')?.setValue(d);
    this.deptoFiltro = d;
    this.deptoOpen = false;
  }
  seleccionarProv(p: string) {
    this.ventaForm.get('provincia')?.setValue(p);
    this.provFiltro = p;
    this.provOpen = false;
  }
  seleccionarDist(d: string) {
    this.ventaForm.get('distrito')?.setValue(d);
    this.distFiltro = d;
    this.distOpen = false;
  }
 
  onBlurDepto() { setTimeout(() => this.deptoOpen = false, 150); }
  onBlurProv() { setTimeout(() => this.provOpen = false, 150); }
  onBlurDist() { setTimeout(() => this.distOpen = false, 150); }
 
  constructor(
    private fb: FormBuilder,
    private ventasService: VentasService,
    private clientesService: ClientesService,
    private campanasService: CampanasService,
    private productosService: ProductosService,
    private cdr: ChangeDetectorRef,
    private ubigeoService: UbigeoService
  ) {
    this.ventaForm = this.fb.group({
      tipoDoc: ['DNI', Validators.required],
      nroDoc: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      clienteId: [null, Validators.required],
      nombre: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(2)]],
      apellidoP: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(2)]],
      apellidoM: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(2)]],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      telefono: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(/^9\d{8}$/)]],
      telefonoAlt: [{ value: '', disabled: true }, [Validators.pattern(/^9\d{8}$/)]],
      direccion: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      departamento: [{ value: '', disabled: true }, Validators.required],
      provincia: [{ value: '', disabled: true }, Validators.required],
      distrito: [{ value: '', disabled: true }, Validators.required],
      campanaId: ['', Validators.required],
      productoId: [null],
      monto: [null, [Validators.required, Validators.min(0.01)]],
      fechaVenta: [new Date().toISOString().split('T')[0], Validators.required],
      observaciones: ['', Validators.maxLength(500)]
    });
  }
 
  ngOnInit(): void {
    this.cargarCampanas();
 
    this.ubigeoService.listarDepartamentos().subscribe({
      next: (res: any) => {
        this.departamentos = res
          .filter((r: any) => r.CodigoDepartamento > 0)
          .map((r: any) => r.Descripcion);
        this.cdr.detectChanges();
      }
    });
 
    this.ventaForm.get('departamento')?.valueChanges.subscribe(dep => {
      this.ventaForm.get('provincia')?.setValue('', { emitEvent: false });
      this.ventaForm.get('distrito')?.setValue('', { emitEvent: false });
      this.provFiltro = ''; this.distFiltro = '';
      this.provincias = []; this.distritos = [];
      this.provinciaHabilitada = false;
      this.distritoHabilitado = false;
      if (!dep) return;
 
      this.ubigeoService.listarProvincias(dep).subscribe((res: any) => {
        this.provincias = res
          .filter((r: any) => r.IdUbigeo > 0)
          .map((r: any) => r.Descripcion);
 
        this.provinciaHabilitada = true;
        this.ventaForm.get('provincia')?.enable();
        this.cdr.detectChanges();
      });
    });
 
    this.ventaForm.get('provincia')?.valueChanges.subscribe(prov => {
      this.ventaForm.get('distrito')?.setValue('', { emitEvent: false });
      this.distFiltro = '';
      this.distritos = [];
      this.distritoHabilitado = false;
 
      const dep = this.ventaForm.get('departamento')?.value;
      if (!dep || !prov) {
        this.ventaForm.get('distrito')?.disable();
        return;
      }
 
      this.ubigeoService.listarDistritos(dep, prov).subscribe({
        next: (res: any) => {
          this.distritos = res
            .filter((r: any) => r.IdUbigeo > 0)
            .map((r: any) => r.Descripcion);
 
          if (this.distritos.length > 0) {
            this.distritoHabilitado = true;
            this.ventaForm.get('distrito')?.enable();
          } else {
            this.ventaForm.get('distrito')?.disable();
          }
 
          this.cdr.detectChanges();
        },
        error: () => {
          this.distritoHabilitado = false;
          this.ventaForm.get('distrito')?.disable();
          this.cdr.detectChanges();
        }
      });
    });
 
    this.ventaForm.get('tipoDoc')?.valueChanges.subscribe(tipo => {
      this.actualizarValidacionDoc(tipo);
    });
 
    this.ventaForm.get('campanaId')?.valueChanges.subscribe(campanaId => {
      this.onCampanaChange(campanaId);
    });
 
    this.ventaForm.get('productoId')?.valueChanges.subscribe(productoId => {
      this.onProductoChange(productoId);
    });
    if (this.ventaEditar) {
      this.cargarDatosEdicion();
    }
  }
  cargarDatosEdicion(): void {
    const v = this.ventaEditar!;
 
    // Quitar validación requerida de campos de cliente en modo edición
    this.ventaForm.get('clienteId')?.clearValidators();
    this.ventaForm.get('clienteId')?.updateValueAndValidity();
    this.ventaForm.get('nroDoc')?.clearValidators();
    this.ventaForm.get('nroDoc')?.updateValueAndValidity();
    this.ventaForm.get('nombre')?.clearValidators();
    this.ventaForm.get('nombre')?.updateValueAndValidity();
    this.ventaForm.get('apellidoP')?.clearValidators();
    this.ventaForm.get('apellidoP')?.updateValueAndValidity();
    this.ventaForm.get('email')?.clearValidators();
    this.ventaForm.get('email')?.updateValueAndValidity();
    this.ventaForm.get('telefono')?.clearValidators();
    this.ventaForm.get('telefono')?.updateValueAndValidity();
    this.ventaForm.get('direccion')?.clearValidators();
    this.ventaForm.get('direccion')?.updateValueAndValidity();
    this.ventaForm.get('departamento')?.clearValidators();
    this.ventaForm.get('departamento')?.updateValueAndValidity();
    this.ventaForm.get('provincia')?.clearValidators();
    this.ventaForm.get('provincia')?.updateValueAndValidity();
    this.ventaForm.get('distrito')?.clearValidators();
    this.ventaForm.get('distrito')?.updateValueAndValidity();
 
    this.ventaForm.patchValue({
      clienteId: v.clienteId,
      campanaId: v.campanaId,
      monto: v.monto,
      fechaVenta: v.fechaVenta,
      observaciones: v.observaciones
    });
    const estadosBloqueados = ['CAIDA', 'ACTIVO'];
    if (estadosBloqueados.includes(v.estadoCodigo)) {
      this.ventaForm.get('campanaId')?.disable();
      this.ventaForm.get('productoId')?.disable();
      this.ventaForm.get('monto')?.disable();
      this.ventaForm.get('fechaVenta')?.disable();
      this.ventaForm.get('observaciones')?.disable();
      this.formularioBloqueado = true;
    }
 
    if (v.campanaId) {
      this.loadingProductos = true;
      this.productosService.listarPorCampana(v.campanaId).subscribe({
        next: (lista) => {
          this.productos = lista;
          this.ventaForm.get('productoId')?.setValue(v.productoId, { emitEvent: false });
          this.loadingProductos = false;
          this.cdr.detectChanges();
        },
        error: () => { this.loadingProductos = false; }
      });
    }
  }
 
  get modoEdicion(): boolean {
    return !!this.ventaEditar;
  }
  get inicialesEdicion(): string {
    const nombre = this.ventaEditar?.clienteNombre ?? '';
    const partes = nombre.trim().split(' ');
    return partes.length >= 2
      ? (partes[0][0] + partes[1][0]).toUpperCase()
      : nombre.slice(0, 2).toUpperCase();
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
 
  onCampanaChange(campanaId: string) {
    this.productos = [];
    this.ventaForm.get('productoId')?.setValue(null, { emitEvent: false });
    this.ventaForm.get('productoId')?.disable();  // deshabilitar mientras carga
 
    if (!this.modoEdicion) {
      this.ventaForm.get('monto')?.setValue(null);
    }
 
    if (!campanaId) return;
 
    this.loadingProductos = true;
    this.productosService.listarPorCampana(campanaId).subscribe({
      next: (lista) => {
        this.productos = lista;
        if (!this.formularioBloqueado) {
          this.ventaForm.get('productoId')?.enable(); // rehabilitar al terminar
        }
        this.loadingProductos = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingProductos = false;
        this.cdr.detectChanges();
      }
    });
  }
 
  onDocumentoInput(event: any) {
    const tipo = this.ventaForm.get('tipoDoc')?.value;
    if (tipo === 'CE' || tipo === 'PASAPORTE') {
      const upperValue = event.target.value.toUpperCase();
      this.ventaForm.get('nroDoc')?.setValue(upperValue, { emitEvent: false });
    }
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
            clienteId: cliente.id,
            nombre: cliente.nombre,
            apellidoP: cliente.apellidoP,
            apellidoM: cliente.apellidoM,
            email: cliente.email,
            telefono: cliente.telefono,
            telefonoAlt: cliente.telefonoAlt,
            direccion: cliente.direccion,
            departamento: cliente.departamento || '',
            provincia: cliente.provincia || '',
            distrito: cliente.distrito || '',
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
    const campos = ['nombre', 'apellidoP', 'apellidoM', 'email',
      'telefono', 'telefonoAlt', 'direccion',
      'distrito', 'departamento', 'provincia'];
 
    if (this.esClienteNuevo) {
      // Habilitamos los campos base
      campos.forEach(c => this.ventaForm.get(c)?.enable());
 
      // Como aún no hay provincia elegida, deshabilitar dependientes
      this.ventaForm.get('provincia')?.disable();
      this.ventaForm.get('distrito')?.disable();
 
      this.ventaForm.get('clienteId')?.setValue(null);
      this.ventaForm.get('clienteId')?.clearValidators();
    } else {
      campos.forEach(c => this.ventaForm.get(c)?.disable());
      // Limpiar ubigeo
      this.ventaForm.get('departamento')?.setValue('');
      this.ventaForm.get('provincia')?.setValue('');
      this.ventaForm.get('distrito')?.setValue('');
      this.deptoFiltro = ''; this.provFiltro = ''; this.distFiltro = '';
      this.provincias = []; this.distritos = [];
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
    if (this.formularioBloqueado) return;
    
    // Validar que los campos de ubigeo estén seleccionados cuando es cliente nuevo
    if (this.esClienteNuevo) {
      const dept = this.ventaForm.get('departamento')?.value;
      const prov = this.ventaForm.get('provincia')?.value;
      const dist = this.ventaForm.get('distrito')?.value;
      
      // Validar que el departamento seleccionado esté en la lista
      if (dept && !this.departamentos.includes(dept)) {
        this.ventaForm.get('departamento')?.setErrors({ invalid: true });
      }
      
      // Validar que la provincia seleccionada esté en la lista
      if (prov && !this.provincias.includes(prov)) {
        this.ventaForm.get('provincia')?.setErrors({ invalid: true });
      }
      
      // Validar que el distrito seleccionado esté en la lista
      if (dist && !this.distritos.includes(dist)) {
        this.ventaForm.get('distrito')?.setErrors({ invalid: true });
      }
    }
    
    if (this.ventaForm.invalid) {
      this.ventaForm.markAllAsTouched();
      return;
    }
    
    this.submitting = true;
    const rawValue = this.ventaForm.getRawValue();
 
    if (this.modoEdicion) {
      const payload = {
        campanaId: rawValue.campanaId,
        productoId: rawValue.productoId || null,
        monto: rawValue.monto,
        fechaVenta: rawValue.fechaVenta,
        observaciones: rawValue.observaciones
      };
      this.ventasService.actualizar(this.ventaEditar!.id, payload).subscribe({
        next: (res) => { this.onSave.emit(res); this.submitting = false; },
        error: () => { this.submitting = false; }
      });
      return;
    }
 
    // flujo crear
    if (this.esClienteNuevo) {
      const nuevoCliente: any = {
        tipoDoc: rawValue.tipoDoc,
        nroDoc: rawValue.nroDoc,
        nombre: rawValue.nombre,
        apellidoP: rawValue.apellidoP,
        apellidoM: rawValue.apellidoM,
        email: rawValue.email,
        telefono: rawValue.telefono,
        telefonoAlt: rawValue.telefonoAlt,
        direccion: rawValue.direccion,
        departamento: rawValue.departamento,
        provincia: rawValue.provincia,
        distrito: rawValue.distrito
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
      campanaId: formValues.campanaId,
      productoId: formValues.productoId || null,
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
      error: () => { this.submitting = false; }
    });
  }
 
  actualizarValidacionDoc(tipo: string) {
    const nroDoc = this.ventaForm.get('nroDoc');
    switch (tipo) {
      case 'DNI':
        nroDoc?.setValidators([
          Validators.required,
          Validators.pattern(/^\d{8}$/),
          Validators.minLength(8),
          Validators.maxLength(8)
        ]);
        break;
      case 'RUC':
        nroDoc?.setValidators([
          Validators.required,
          Validators.pattern(/^(10|20)\d{9}$/),
          Validators.minLength(11),
          Validators.maxLength(11)
        ]);
        break;
      case 'CE':
        nroDoc?.setValidators([
          Validators.required,
          Validators.pattern(/^[A-Z0-9]{9,12}$/),
          Validators.minLength(9),
          Validators.maxLength(12)
        ]);
        break;
      case 'PASAPORTE':
        nroDoc?.setValidators([
          Validators.required,
          Validators.pattern(/^[A-Z0-9]{6,20}$/),
          Validators.minLength(6),
          Validators.maxLength(20)
        ]);
        break;
    }
    nroDoc?.reset('');
    nroDoc?.updateValueAndValidity();
  }
 
  get placeholderDoc(): string {
    const tipo = this.ventaForm.get('tipoDoc')?.value;
    switch (tipo) {
      case 'DNI': return 'Ej. 74385427 (8 dígitos)';
      case 'RUC': return 'Ej. 20123456789 (empieza con 10 o 20, 11 dígitos)';
      case 'CE': return 'Ej. 001234567 (9-12 caracteres alfanuméricos)';
      case 'PASAPORTE': return 'Ej. AB123456 (6-20 caracteres alfanuméricos)';
      default: return 'Número de documento';
    }
  }
 
  getError(campo: string): string {
    const control = this.ventaForm.get(campo);
    if (!control || !control.invalid || !control.touched) return '';
 
    if (control.hasError('required')) return 'Este campo es obligatorio';
    if (control.hasError('email')) return 'Ingresa un correo válido (ej. nombre@correo.com)';
    if (control.hasError('min')) return 'El monto debe ser mayor a 0';
    if (control.hasError('maxlength')) return `Máximo ${control.errors?.['maxlength'].requiredLength} caracteres`;
    if (control.hasError('minlength')) return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
    if (control.hasError('invalid')) {
      if (campo === 'departamento') return 'Debes seleccionar un departamento válido de la lista';
      if (campo === 'provincia') return 'Debes seleccionar una provincia válida de la lista';
      if (campo === 'distrito') return 'Debes seleccionar un distrito válido de la lista';
    }
 
    if (control.hasError('pattern')) {
      if (campo === 'telefono' || campo === 'telefonoAlt')
        return 'Debe ser un celular peruano (9 dígitos, empieza en 9)';
      if (campo === 'nroDoc') {
        const tipo = this.ventaForm.get('tipoDoc')?.value;
        if (tipo === 'DNI') return 'El DNI debe tener exactamente 8 dígitos numéricos';
        if (tipo === 'RUC') return 'El RUC debe empezar con 10 o 20 y tener 11 dígitos';
        if (tipo === 'CE') return 'El CE debe tener entre 9-12 caracteres alfanuméricos';
        if (tipo === 'PASAPORTE') return 'El Pasaporte debe tener entre 6-20 caracteres alfanuméricos';
        return 'Formato de documento inválido';
      }
    }
    return '';
  }
}