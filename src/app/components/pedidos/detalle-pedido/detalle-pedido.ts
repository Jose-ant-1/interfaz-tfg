import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PedidoService } from '../../../service/pedido.service';
import { Pedido } from '../../../models/pedido.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalle-pedido',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalle-pedido.html'
})
export class DetallePedidoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private pedidoService = inject(PedidoService);

  pedido = signal<Pedido | null>(null);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.pedidoService.getPedidoById(id).subscribe({
        next: (data) => this.pedido.set(data),
        error: (err) => {
          this.error.set('No tienes permiso para ver este pedido o no existe.');
          console.error(err);
        }
      });
    }
  }
}
