import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CarritoService } from '../../service/carrito.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './carrito.html'
})
export class CarritoComponent {
  public carritoService = inject(CarritoService);

  // Accedemos a los items a través del signal que creamos en el servicio
  items = this.carritoService.items;

  aumentar(producto: any) {
    this.carritoService.agregarProducto(producto);
  }

  reducir(id: number) {
    this.carritoService.decrementarProducto(id);
  }

}
