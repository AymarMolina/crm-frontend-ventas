import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CampanaResponse, CrearCampanaRequest, CrearProductoRequest, GerenteService, LineaProducto } from '../../../core/services/gerente.service';
import { CampanasService } from '../../../core/services/campanas.service';
import { Campana } from '../../../core/models/crm.models';
import { ProductosService } from '../../../core/services/Productos.service';

@Component({
  selector: 'app-crear-campana',
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-campana.html',
})
export class CrearCampana implements OnInit {
  
  campanas: Campana[] = []; 
  campanasFiltradas: Campana[] = []; 
  campanaSeleccionadaId: string = '';

  lineas: LineaProducto[] = [];
  loading  = true;
  guardando = false;
  error  = '';
  exito  = false;

  campanaCreadaId: string | null = null;
  
  nuevoProducto: CrearProductoRequest = {
    nombre: '',
    descripcion: '',
    precio: 0
  };
  productosAgregados: any[] = [];

  form: CrearCampanaRequest = {
    nombre:        '',
    lineaId:       0,
    mes:           new Date().getMonth() + 1,
    anio:          new Date().getFullYear(),
    objetivoTotal: 0,
  };

  meses = [
    { valor: 1,  label: 'Enero'      },
    { valor: 2,  label: 'Febrero'    },
    { valor: 3,  label: 'Marzo'      },
    { valor: 4,  label: 'Abril'      },
    { valor: 5,  label: 'Mayo'       },
    { valor: 6,  label: 'Junio'      },
    { valor: 7,  label: 'Julio'      },
    { valor: 8,  label: 'Agosto'     },
    { valor: 9,  label: 'Septiembre' },
    { valor: 10, label: 'Octubre'    },
    { valor: 11, label: 'Noviembre'  },
    { valor: 12, label: 'Diciembre'  },
  ];

  anios: number[] = [];

  constructor(private gerenteService: GerenteService,private cdr: ChangeDetectorRef,private campanasService:CampanasService,private productoService:ProductosService) {}

  ngOnInit() {
    this.cargarDatosIniciales();
    // Generar años
    const actual = new Date().getFullYear();
    for (let y = 2024; y <= actual + 1; y++) this.anios.push(y);
  }

  cargarDatosIniciales() {
    this.loading = true;

    this.gerenteService.getLineas().subscribe({
      next: (data) => { 
        this.lineas = data; 
        this.loading = false;
        this.campanasService.listarCampanas().subscribe(data => {
          this.campanas = data;
          this.campanasFiltradas = data; 
          this.cdr.detectChanges();
        });
      },
      error: () => { this.error = 'Error al cargar líneas'; this.loading = false; }
    });
  }
  get formInvalido(): boolean {
    return !this.form.nombre.trim()
      || !this.form.lineaId
      || !this.form.mes
      || !this.form.anio
      || this.form.objetivoTotal <= 0;
  }

  guardar() {
    if (this.formInvalido) return;

    this.guardando = true;
    this.error = '';

    this.gerenteService.crearCampana(this.form).subscribe({
      next: (response: any) => {

        const campanaCreada = response as Campana; 
        
        this.campanaCreadaId = campanaCreada.id;
        this.campanas.push(campanaCreada);
        this.campanasFiltradas = [...this.campanas];
        this.campanaSeleccionadaId = campanaCreada.id;

        this.exito = true;
        this.guardando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error al guardar';
        this.guardando = false;
      }
    });
  }

  agregarProducto() {
    if (!this.campanaCreadaId || !this.nuevoProducto.nombre) return;
    
    this.gerenteService.crearProducto(this.campanaCreadaId, this.nuevoProducto).subscribe({
      next: (prod) => {
        this.productosAgregados.push(prod);
        // Resetear form de producto
        this.nuevoProducto = { nombre: '', descripcion: '', precio: 0 };
        this.cdr.detectChanges();
      },
      error: () => this.error = 'Error al agregar producto.'
    });
  }
  filtrarCampanas(lineaCodigo: string) {
    if (!lineaCodigo) {
      this.campanasFiltradas = this.campanas;
    } else {
      this.campanasFiltradas = this.campanas.filter(c => c.lineaCodigo === lineaCodigo);
    }
    this.campanaSeleccionadaId = ''; 
  }
  onSeleccionarCampana() {
    if (!this.campanaSeleccionadaId) {
      this.finalizar(); 
      return;
    }

    const encontrada = this.campanas.find(c => c.id === this.campanaSeleccionadaId);
    if (encontrada) {
      this.campanaCreadaId = encontrada.id;
      this.exito = false;
      this.error = '';

      this.form = {
        nombre: encontrada.nombre,
        lineaId: this.lineas.find(l => l.codigo === encontrada.lineaCodigo)?.id || 0,
        mes: encontrada.mes,
        anio: encontrada.anio,
        objetivoTotal: encontrada.objetivoTotal
      };
      
      this.productoService.listarPorCampana(encontrada.id).subscribe(prods => {
        this.productosAgregados = prods;
        this.cdr.detectChanges();
      });
    }
  }

  finalizar() {
    this.campanaCreadaId = null;
    this.campanaSeleccionadaId = '';
    this.productosAgregados = [];
    this.form = { nombre: '', lineaId: 0, mes: new Date().getMonth() + 1, anio: new Date().getFullYear(), objetivoTotal: 0 };
    this.cdr.detectChanges();
  }
}