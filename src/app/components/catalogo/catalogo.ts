import {Component, inject} from '@angular/core';
import {ProdPredService} from '../../service/prod.predis.service';
import {CurrencyPipe} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-catalogo',
  imports: [
    CurrencyPipe,
    RouterLink
  ],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo {

  private productoService = inject(ProdPredService);

  // Exponemos el signal del servicio al HTML
  productos = this.productoService.productos;

  ngOnInit() {
    this.productoService.obtenerTodos();
  }

  borrarProducto(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.')) {
      this.productoService.eliminar(id).subscribe({
        next: () => {
          // Refrescamos la lista llamando al método que ya tienes
          this.productoService.obtenerTodos();
        },
        error: (err) => {
          console.error("Error al eliminar:", err);
          alert("No se pudo eliminar el producto. Verifica si tiene pedidos asociados.");
        }
      });
    }
  }

}
