export interface Pedido {
  idPedido: number;
  numeroPedido: string;
  total: number;
  estado: string; // "pendiente de pago", "pagado", "enviado", etc.
  direccionEnvio: string;
  fechaPedido: string;
  usuario?: {
    nombre: string;
    email: string;
  };
}
