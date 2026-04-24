export interface Pago {
  id?: number;
  idUsuario: number;
  idPedido?: number;
  idSolicitud?: number;
  importe: number;
  metodoPago: string; // 'TARJETA', 'PAYPAL', etc.
  estadoPago: string; // 'COMPLETADO', 'PENDIENTE'
  idTransaccion: string;
  detalles?: string;
  fechaPago?: string;
}
