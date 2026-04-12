import { Component, OnInit, inject } from '@angular/core';
import { PedidoService } from '../../service/pedido.service';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-pedidos-lista',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './pedido-lista-component.html'
})
export class PedidosListaComponent implements OnInit {
  public pedidoService = inject(PedidoService);

  ngOnInit() {
    this.pedidoService.obtenerTodos();
  }

  cambiarEstado(id: number, estado: string) {
    this.pedidoService.actualizarEstado(id, estado).subscribe(() => {
      this.pedidoService.obtenerTodos();
    });
  }
}
