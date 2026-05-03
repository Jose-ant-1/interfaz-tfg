import { Component, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CarritoService } from '../../service/carrito.service';
import { RouterLink, Router } from '@angular/router'; // <-- Añadido Router
import { ProdPredService } from '../../service/prod.predis.service'; // <-- Asegúrate de que la ruta es correcta
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './carrito.html'
})
export class CarritoComponent {
  public carritoService = inject(CarritoService);
  private router = inject(Router);
  private prodService = inject(ProdPredService); // Para buscar el stock

  items = this.carritoService.items;

  // Nuevas señales para la validación
  cargandoPago = signal(false);
  erroresStock = signal<string[]>([]);

  aumentar(item: any) {
    this.carritoService.agregarProducto(item, 1);
    this.erroresStock.set([]); // Limpiamos errores si el usuario cambia algo
  }

  reducir(item: any) {
    const idProducto = item.productoId || item.id;
    if (idProducto) {
      this.carritoService.decrementarProducto(idProducto);
      this.erroresStock.set([]); // Limpiamos errores si el usuario cambia algo
    }
  }

  procederAlPago() {
    const carritoActual = this.items();
    if (carritoActual.length === 0) return;

    this.cargandoPago.set(true);
    this.erroresStock.set([]);

    // Preparamos las llamadas al servidor para comprobar el stock de cada producto
    // NOTA: Usa el método exacto que tengas en ProdPredService para buscar por ID
    const validacionesStock = carritoActual.map(item => {
      const idReal = item.productoId || item.id;
      return this.prodService.obtenerPorId(idReal).pipe( // <-- Cámbialo si tu método se llama distinto (ej. getProductoPorId)
        catchError(() => of(null)) // Si falla uno, devolvemos null para no romper el forkJoin
      );
    });

    // Ejecutamos todas las comprobaciones a la vez
    forkJoin(validacionesStock).subscribe({
      next: (productosDB) => {
        const errores: string[] = [];

        carritoActual.forEach((item, index) => {
          const productoReal = productosDB[index];

          if (!productoReal) {
            errores.push(`El producto "${item.nombre}" ya no está disponible.`);
          } else if (item.cantidad > productoReal.stockDisponible) {
            errores.push(`No hay stock suficiente de "${item.nombre}".`);
          }
        });

        if (errores.length > 0) {
          // Si hay errores, los mostramos y nos quedamos en la página
          this.erroresStock.set(errores);
          this.cargandoPago.set(false);
        } else {
          // Si todo está bien, cerramos el candado y navegamos a /pago
          this.cargandoPago.set(false);
          this.router.navigate(['/pago']);
        }
      },
      error: (err) => {
        console.error('Error al validar el stock', err);
        this.cargandoPago.set(false);
      }
    });
  }

  vaciarCarrito() {
    if (confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) {
      this.carritoService.limpiarCarrito();
      this.erroresStock.set([]); // Limpiamos posibles errores de stock previos
    }
  }

}
