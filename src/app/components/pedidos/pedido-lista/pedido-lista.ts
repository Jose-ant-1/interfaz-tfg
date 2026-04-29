import { Component, OnInit, inject, signal, computed } from '@angular/core';
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

  // Helper para normalizar strings de estado y evitar errores de comparación
  private normalizarEstado(estado: string): string {
    return estado?.toUpperCase().replace(/[\s_]/g, '') || '';
  }

  pedidosPendientes = computed(() =>
    this.pedidoService.pedidos().filter((p) => {
      const s = this.normalizarEstado(p.estado);
      return s === 'PENDIENTE' || s === 'ENPROCESO' || s === 'RECLAMADO';
    }),
  );

  pedidosCompletados = computed(() =>
    this.pedidoService.pedidos().filter((p) => {
      const s = this.normalizarEstado(p.estado);
      return s === 'ENVIADO' || s === 'COMPLETADO' || s === 'CANCELADO';
    }),
  );

  ngOnInit() {
    this.pedidoService.obtenerTodos();
  }

  toggleDetalles(id: number) {
    this.idPedidoExpandido.update((current) => (current === id ? null : id));
  }

  cambiarEstado(id: number, estado: string) {
    this.pedidoService.actualizarEstado(id, estado).subscribe({
      next: () => this.pedidoService.obtenerTodos(),
      error: (err) => console.error('Error al actualizar estado', err),
    });
  }

  // Nueva función para usar en el HTML y que los botones no fallen por un "_"
  esEstado(pedidoEstado: string, estadoObjetivo: string): boolean {
    return this.normalizarEstado(pedidoEstado) === this.normalizarEstado(estadoObjetivo);
  }
}
