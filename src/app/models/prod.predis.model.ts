export interface Producto {
  id?: number;
  nombreProducto: string;
  descripcion: string;
  precio: number;
  stockDisponible: number;
  dimensiones?: string;
  pesoGramos: number;
  imagenUrl: string;
  tiempoImpresionMinutos: number;
  idCategoria: number;
  caracteristicas?: string;
  destacado: boolean;
  disponible: boolean;

  material?: any;
  tecnologia?: any;
}
