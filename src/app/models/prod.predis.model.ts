export interface Producto {
  id?: number;
  nombreProducto: string;
  descripcion: string;
  caracteristicas: string;
  precio: number;
  stockDisponible: number;
  dimensiones: string;
  pesoGramos: number;
  tiempoImpresionMinutos: number;
  imagenUrl: string;
  destacado: boolean;
  disponible: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;

  // Relaciones
  material?: any;
  tecnologia?: any;
}
