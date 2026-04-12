import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProdPredService } from '../../service/prod.predis.service';
import { CurrencyPipe } from '@angular/common';
import {CarritoService} from '../../service/carrito.service';

@Component({
  selector: 'app-prod-pred-detalle',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],

  templateUrl: './prod.pred.detalle.html',
  styleUrl: './prod.pred.detalle.css'
})
export class DetalleProductoPredis implements OnInit {

  private route = inject(ActivatedRoute);
  private prodService = inject(ProdPredService);
  private carritoService = inject(CarritoService);

  producto = signal<any>(null);


  agregarAlCarrito(p: any) {
    if (!p) return; // Seguridad por si el producto aún no ha cargado

    const productoNormalizado = {
      id: p.id,
      nombre: p.nombreProducto, // Mapeo de nombre
      precio: p.precio,
      imagenUrl: p.imagenUrl,
      cantidad: 1
    };

    this.carritoService.agregarProducto(productoNormalizado);
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {

      this.prodService.obtenerPorId(+id).subscribe({

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
