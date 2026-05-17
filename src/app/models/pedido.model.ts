import { Producto } from './prod.predis.model';
import { Usuario } from './usuario.model';
import {SolicitudPersonalizada} from './solicitud-personalizada.model';

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
  ciudadEnvio?: string;
  codigoPostalEnvio?: string;
  notaCliente?: string;
  fechaPedido: string;
  fechaActualizacion?: string;
  metodoPagoDetalle?: string;
  solicitud?: SolicitudPersonalizada;
  items?: ItemPedido[];

  usuario?: Usuario;

  pagos?: any[];
}
