import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PedidoService } from '../../../service/pedido.service';
import { Pedido } from '../../../models/pedido.model';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mis-pedidos.html',
})
export class MisPedidosComponent implements OnInit {
  private pedidoService = inject(PedidoService);

  pedidos = signal<Pedido[]>([]);

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

  reclamarPedido(id: number) {
    const motivo = prompt(
      'Por favor, indica el motivo de la reclamación (ej: producto dañado, no ha llegado...):',
    );

    if (motivo && motivo.trim().length > 0) {
      this.pedidoService.reclamar(id, motivo).subscribe({
        next: () => {
          alert('Reclamación enviada con éxito');
          this.cargarPedidos();
        },
        error: (err) => alert('Error al enviar la reclamación'),
      });
    } else if (motivo !== null) {
      alert('Debes escribir un motivo para poder reclamar.');
    }
  }

  esEstado(pedidoEstado: string, estadoObjetivo: string): boolean {
    const normalizar = (s: string) => s?.toUpperCase().replace(/[\s_]/g, '') || '';
    return normalizar(pedidoEstado) === normalizar(estadoObjetivo);
  }

  esReclamable(pedido: Pedido): boolean {
    // 1. Si ya está reclamado, no se puede volver a reclamar
    if (pedido.estado === 'RECLAMADO') return false;

    // 2. Solo se puede reclamar si está en un estado final de entrega
    const estadosValidos = ['ENVIADO', 'COMPLETADO', 'ENTREGADO']; // Asegúrate de incluir 'ENTREGADO'
    if (!estadosValidos.includes(pedido.estado)) return false;

    // 3. Validación de las 24 horas
    const fechaReferencia = pedido.fechaActualizacion;

    if (!fechaReferencia) return true; // Si no hay fecha, permitimos por precaución

    const fechaUpdate = new Date(fechaReferencia);
    const limiteReclamacion = fechaUpdate.getTime() + 24 * 60 * 60 * 1000; // Fecha update + 24h
    const ahora = new Date().getTime();

    return ahora <= limiteReclamacion; // Solo true si no han pasado las 24h
  }
}
