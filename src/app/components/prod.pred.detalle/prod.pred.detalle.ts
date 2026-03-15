import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProdPredService } from '../../service/prod.predis.service'; // Asegúrate que la ruta es correcta
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-prod-pred-detalle',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  // 1. Asegúrate de que el nombre del archivo sea el correcto aquí:
  templateUrl: './prod.pred.detalle.html',
  styleUrl: './prod.pred.detalle.css'
})
export class DetalleProductoPredis implements OnInit {
  private route = inject(ActivatedRoute);
  private prodService = inject(ProdPredService); // Aquí se llama prodService

  producto = signal<any>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // 2. Usamos 'prodService' que es como lo hemos inyectado arriba
      this.prodService.obtenerPorId(+id).subscribe({
        // 3. Añadimos tipos (p: any) y (err: any) para que TS no se queje
        next: (p: any) => {
          this.producto.set(p);
        },
        error: (err: any) => {
          console.error('Producto no encontrado', err);
        }
      });
    }
  }
}
