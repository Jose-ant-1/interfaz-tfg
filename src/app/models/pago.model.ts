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
  metodoPago: string; // 'TARJETA', 'PAYPAL', etc.
  estadoPago: string; // 'COMPLETADO', 'PENDIENTE'
  idTransaccion: string;
  detalles?: string;
  fechaPago?: string;
}
