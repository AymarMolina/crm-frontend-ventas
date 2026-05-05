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
  apellidos: string;
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
  clienteId?: string;
  clienteNombre?: string;
  clienteDoc?: string;
  clienteTelefono?: string;
  codigoVenta: string;
  fechaVenta?: string;  // ISO date YYYY-MM-DD
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
  // Agrega estas dos para limpiar los errores del HTML:
  comisionPorcentaje?:number;
  comisionGenerada?:number;
  lineaNombre: string;
  campanaNombre: string;
}

// ── Campañas ──────────────────────────────────────────
export type LineaCodigo = 'MIGRACIONES' | 'MOVIL' | 'INTERNET';

export interface Campana {
  id: string;
  nombre: string;
  lineaCodigo: LineaCodigo;
  mes: number;
  anio: number;
  activo: boolean;
}
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}