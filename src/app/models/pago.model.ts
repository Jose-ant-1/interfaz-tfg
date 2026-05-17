export interface Pago {
  id?: number;
  usuario?: { id: number  };
  pedido?: {
    idPedido: number,
    ciudadEnvio?: string,
    codigoPostalEnvio?: string
  };
  solicitud?: {id: number};
  importe: number;
  metodoPago: string;
  estadoPago: string;
  idTransaccion: string;
  detalles?: string;
  fechaPago?: string;
}
