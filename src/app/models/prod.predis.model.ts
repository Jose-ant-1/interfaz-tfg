export interface Producto {
  id?: number;
  nombreProducto: string;       // nombre_producto
  descripcion: string;          // descripción
  caracteristicas: string;      // caracteristicas
  precio: number;               // precio
  stockDisponible: number;      // Stock_disponible
  dimensiones: string;          // dimensiones
  pesoGramos: number;           // peso_gramos
  tiempoImpresionMinutos: number; // tiempo_impresion_minutos
  imagenUrl: string;            // imagen_url
  destacado: boolean;           // destacado
  disponible: boolean;          // disponible
  fechaCreacion?: string;       // fecha_creacion
  fechaActualizacion?: string;  // fecha_actualizacion

  // Relaciones (Objetos completos para los combos)
  material?: any;               // id_material
  tecnologia?: any;             // id_tecnologia
}
