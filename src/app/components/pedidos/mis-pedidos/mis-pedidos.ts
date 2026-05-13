import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PedidoService } from '../../../service/pedido.service';
import { Pedido } from '../../../models/pedido.model';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mis-pedidos.html',
})
export class MisPedidosComponent implements OnInit {
  private pedidoService = inject(PedidoService);

  pedidos = signal<Pedido[]>([]);
  mensajeFeedback = signal<{ texto: string; tipo: 'success' | 'error' } | null>(null);
  pedidoEnReclamacion = signal<number | null>(null);
  motivoReclamacion = signal('');

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.pedidoService.getMisPedidos().subscribe({
      next: (data) => {
        this.pedidos.set(Array.isArray(data) ? data : []);
      },
      error: (err) => {
        console.error('Error al cargar pedidos', err);
        this.pedidos.set([]);
      },
    });
  }

  iniciarReclamacion(id: number) {
    this.pedidoEnReclamacion.set(id);
    this.motivoReclamacion.set('');
  }

  cancelarReclamacion() {
    this.pedidoEnReclamacion.set(null);
    this.motivoReclamacion.set('');
  }

  enviarReclamacion(id: number) {
    const motivo = this.motivoReclamacion().trim();

    if (!motivo) {
      this.mostrarFeedback('Debes escribir un motivo para la reclamación', 'error');
      return;
    }

    this.pedidoService.reclamar(id, motivo).subscribe({
      next: () => {
        this.mostrarFeedback('Reclamación enviada con éxito', 'success');
        this.pedidoEnReclamacion.set(null);
        this.cargarPedidos();
      },
      error: () => this.mostrarFeedback('Error al enviar la reclamación', 'error'),
    });
  }

  mostrarFeedback(texto: string, tipo: 'success' | 'error') {
    this.mensajeFeedback.set({ texto, tipo });
    setTimeout(() => this.mensajeFeedback.set(null), 3000); // Se oculta tras 3 segundos
  }

  esEstado(pedidoEstado: string, estadoObjetivo: string): boolean {
    const normalizar = (s: string) => s?.toUpperCase().replace(/[\s_]/g, '') || '';
    return normalizar(pedidoEstado) === normalizar(estadoObjetivo);
  }

  esReclamable(pedido: Pedido): boolean {
    // 1. Si ya está reclamado, no se puede volver a reclamar
    if (pedido.estado === 'RECLAMADO') return false;

    // 2. Verificar que el estado sea apto para reclamación
    const estadosValidos = ['ENVIADO', 'COMPLETADO', 'ENTREGADO'];
    if (!estadosValidos.includes(pedido.estado)) return false;

    // 3. RESTRICCIÓN TEMPORAL: Máximo 24 horas desde la creación del pedido
    if (!pedido.fechaPedido) return false;

    const fechaPedido = new Date(pedido.fechaPedido).getTime();
    const ahora = new Date().getTime();
    const unDiaEnMilisegundos = 24 * 60 * 60 * 1000;

    // Retorna true solo si han pasado menos de 24 horas
    return ahora - fechaPedido < unDiaEnMilisegundos;
  }
}
