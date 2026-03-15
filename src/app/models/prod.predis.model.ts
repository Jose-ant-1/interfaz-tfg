export interface Producto {
  id?: number; // Opcional porque al crear no existe
  nombreProducto: string;
  descripcion: string;
  precio: number; // Java double
  stockDisponible: number; // Java int
  dimensiones?: string;
  pesoGramos: number; // Java double - Quita el '?' para obligarte a ponerlo
  tiempoImpresionMinutos: number; // Java int - ¡Faltaba aquí!
  idCategoria: number; // Java int - ¡Faltaba aquí!
  caracteristicas?: string;
  destacado: boolean; // ¡Faltaba aquí!
  disponible: boolean;
  // Para las relaciones, de momento puedes ponerlos como opcionales
  material?: any;
  tecnologia?: any;
}
