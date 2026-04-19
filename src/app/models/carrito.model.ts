export interface CarritoModel {
  id: number;          // ID del elemento_carrito (para borrar)
  productoId: number;  // ID del producto (para añadir/restar)
  nombre: string;
  precio: number;
  cantidad: number;
  imagenUrl: string;
}
