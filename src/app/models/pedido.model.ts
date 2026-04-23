import { Producto } from './prod.predis.model';
import { Usuario } from './usuario.model';

export interface ItemPedido {
  id: number;
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
}

export interface Pedido {
  idPedido: number;
  numeroPedido: string;
  subtotal: number;
  gastosEnvio: number;
  total: number;
  estado: string;
  direccionEnvio: string;
  notaCliente?: string; // <-- Faltaba (corresponde a nota_cliente)
  fechaPedido: string; // LocalDate en Java
  fechaActualizacion?: string; // <-- Faltaba (corresponde a fecha_actualizacion)

  items?: ItemPedido[];

  // Vinculamos con el modelo de Usuario completo para tener acceso a todos sus datos
  usuario?: Usuario;

  // El set de pagos en Java lo mapeamos como un array opcional aquí
  pagos?: any[];
}
