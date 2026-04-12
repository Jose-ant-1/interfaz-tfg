export interface Pedido {
  idPedido: number;
  numeroPedido: string;
  total: number;
  estado: string;
  direccionEnvio: string;
  fechaPedido: string;
  usuario?: {
    nombre: string;
    email: string;
  };
}
