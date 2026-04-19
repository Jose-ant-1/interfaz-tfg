import { Producto } from './prod.predis.model';

export interface ItemPedido {
  id: number;
  producto: Producto; // Aquí viene la imagen y el nombre
  cantidad: number;
  precioUnitario: number;
}

export interface Pedido {
  idPedido: number;
  numeroPedido: string;
  total: number;
  subtotal: number;
  gastosEnvio: number;
  estado: string;
  direccionEnvio: string;
  fechaPedido: string;
  items?: ItemPedido[]; // <-- IMPORTANTE: Añadimos los productos del pedido
  pago?: any; // Para mostrar el método de pago
  usuario?: {
    id: number;
    nombre: string;
    email: string;
  };
}
