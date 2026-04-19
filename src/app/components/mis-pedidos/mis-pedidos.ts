import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PedidoService } from '../../service/pedido.service';
import { Pedido } from '../../models/pedido.model'; // Usamos el nuevo modelo

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mis-pedidos.html'
})
export class MisPedidosComponent implements OnInit {
  private pedidoService = inject(PedidoService);

  // Usar Signal con tipo Pedido[] e inicializar a [] evita el error de iterador
  pedidos = signal<Pedido[]>([]);

  ngOnInit(): void {
    this.pedidoService.getMisPedidos().subscribe({
      next: (data) => {
        // Forzamos que la data se trate como array.
        // Si por algún motivo la API fallara y devolviera un objeto de error (Blob),
        // esto evitaría que llegara al HTML.
        this.pedidos.set(Array.isArray(data) ? data : []);
      },
      error: (err) => {
        console.error('Error al cargar pedidos', err);
        this.pedidos.set([]);
      }
    });
  }
}
