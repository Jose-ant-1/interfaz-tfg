import { Component, OnInit, inject, signal } from '@angular/core'; // Añadimos signal
import { PedidoService } from '../../../service/pedido.service';
import { CurrencyPipe, DatePipe, CommonModule } from '@angular/common'; // Añadimos CommonModule

@Component({
  selector: 'app-pedidos-lista',
  standalone: true,
  imports: [CurrencyPipe, CommonModule],
  templateUrl: './pedido-lista-component.html',
})
export class PedidosListaComponent implements OnInit {
  public pedidoService = inject(PedidoService);

  // Signal para controlar qué fila está abierta
  idPedidoExpandido = signal<number | null>(null);

  ngOnInit() {
    this.pedidoService.obtenerTodos();
  }

  toggleDetalles(id: number) {
    // Si ya está abierto, lo cerramos (null), si no, abrimos el nuevo ID
    this.idPedidoExpandido.update((current) => (current === id ? null : id));
  }

  cambiarEstado(id: number, estado: string) {
    this.pedidoService.actualizarEstado(id, estado).subscribe(() => {
      this.pedidoService.obtenerTodos();
    });
  }
}
