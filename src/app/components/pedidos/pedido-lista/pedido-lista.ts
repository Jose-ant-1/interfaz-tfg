import { Component, OnInit, inject, signal, computed } from '@angular/core'; // Añadimos computed
import { PedidoService } from '../../../service/pedido.service';
import { CurrencyPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-pedidos-lista',
  standalone: true,
  imports: [CurrencyPipe, CommonModule],
  templateUrl: './pedido-lista.html',
})
export class PedidosListaComponent implements OnInit {
  public pedidoService = inject(PedidoService);

  idPedidoExpandido = signal<number | null>(null);

  // Filtrar pedidos pendientes o en proceso
  pedidosPendientes = computed(() =>
    this.pedidoService
      .pedidos()
      .filter((p) => p.estado === 'PENDIENTE' || p.estado === 'EN_PROCESO'),
  );

  // Filtrar pedidos terminados/enviados
  pedidosCompletados = computed(() =>
    this.pedidoService
      .pedidos()
      .filter((p) => p.estado === 'COMPLETADO' || p.estado === 'CANCELADO'),
  );

  ngOnInit() {
    this.pedidoService.obtenerTodos();
  }

  toggleDetalles(id: number) {
    this.idPedidoExpandido.update((current) => (current === id ? null : id));
  }

  cambiarEstado(id: number, estado: string) {
    this.pedidoService.actualizarEstado(id, estado).subscribe(() => {
      this.pedidoService.obtenerTodos();
    });
  }
}
