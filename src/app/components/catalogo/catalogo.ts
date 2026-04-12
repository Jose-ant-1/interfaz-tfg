// catalogo.ts
import { Component, inject, OnInit } from '@angular/core';
import { ProdPredService } from '../../service/prod.predis.service';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarritoService } from '../../service/carrito.service';
import { AuthService } from '../../service/auth.service'; // <--- Importar

@Component({
  selector: 'app-catalogo',
  standalone: true, // Asegúrate de que tenga standalone si usas imports directos
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo implements OnInit {
  private productoService = inject(ProdPredService);
  private carritoService = inject(CarritoService);
  public authService = inject(AuthService); // <--- Inyectar para usar en el HTML

  productos = this.productoService.productos;

  ngOnInit() {
    this.productoService.obtenerTodos();
  }

  // Lógica para el HTML (basada en tu descubrimiento anterior de "ADMIN")
  esAdmin(): boolean {
    return this.authService.currentUser()?.roles.includes('ADMIN') || false;
  }

  agregarAlCarrito(producto: any) {
    this.carritoService.agregarProducto(producto);
  }

  borrarProducto(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.productoService.eliminar(id).subscribe({
        next: () => this.productoService.obtenerTodos(),
        error: (err) => console.error("Error al eliminar:", err)
      });
    }
  }
}
