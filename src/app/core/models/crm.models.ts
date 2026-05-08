import { DecimalPipe } from "@angular/common";

// ── Auth ──────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  rol: 'GERENTE' | 'SUPERVISOR' | 'BACK_OFFICE' | 'AGENTE';
  nombres: string;
  debeCambiarPass: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number; // Antes decía 'number'
  size: number;
  last: boolean; // Añade esta para controlar el botón "Siguiente"
}

// ── Clientes ──────────────────────────────────────────
export type TipoDoc = 'DNI' | 'CE' | 'RUC' | 'PASAPORTE';

export interface ClienteRequest {
  tipoDoc: TipoDoc;
  nroDoc: string;
  nombre: string;
  apellidoP: string;
  apellidoM: string;
  telefono?: string;
  telefonoAlt?: string;
  nombreCompleto?: string;
  email?: string;
  direccion?: string;
  distrito?: string;
}

export interface Cliente extends ClienteRequest {
  id: string;
  activo: boolean;
}

// ── Ventas ────────────────────────────────────────────
export type EstadoVenta = 'ACTIVO' | 'EN_PROCESO' | 'OBSERVADO' | 'CAIDA';

export interface VentaRequest {
  campanaId: string;
  productoId?: string;    
  clienteId?: string;
  clienteNombre?: string;
  clienteDoc?: string;
  clienteTelefono?: string;
  fechaVenta?: string;
  monto?: number;
  observaciones?: string;
}
export interface CambioEstadoRequest {
  estadoCodigo: EstadoVenta;
  motivo?: string;
}

export interface Venta {
  id: string;
  campanaId: string;
  clienteId?: string;
  clienteNombre: string;
  clienteDoc?: string;
  clienteTelefono?: string;
  codigoVenta: string;
  fechaVenta: string;
  alertaDetalle?: string;
  monto?: number;
  estadoCodigo: EstadoVenta;
  tieneAlerta: boolean;
  observaciones?: string;
  eliminado: boolean;
  estadoNombre?: string;
  comisionPorcentaje?: number;
  comisionGenerada?: number;
  lineaNombre: string;
  campanaNombre: string;
  productoId?: string;
  productoNombre?: string;
  productoPrecio?: number;
}

// ── Campañas ──────────────────────────────────────────
export type LineaCodigo = 'MIGRACIONES' | 'MOVIL' | 'INTERNET';

export interface Campana {
  id: string;
  nombre: string;
  lineaCodigo: LineaCodigo;
  mes: number;
  anio: number;
  objetivoTotal:number;
  activo: boolean;
}
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
// ── Productos ─────────────────────────────────────────
export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  activo: boolean;
  campanaId: string;
  campanaNombre: string;
}

export interface ProductoRequest {
  campanaId: string;
  nombre: string;
  descripcion?: string;
  precio: number;
}