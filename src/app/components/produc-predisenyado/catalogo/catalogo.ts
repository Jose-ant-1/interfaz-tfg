import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProdPredService } from '../../../service/prod.predis.service';
import { CarritoService } from '../../../service/carrito.service';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo implements OnInit {
  private productoService = inject(ProdPredService);
  private carritoService = inject(CarritoService);
  public authService = inject(AuthService);

  private productosBase = this.productoService.productos;

  // Lógica de visualización: Admin ve todos, Usuario solo disponibles
  productosOrdenados = computed(() => {
    const listado = this.productosBase(); // Esto reacciona a cualquier cambio

    if (this.esAdmin()) {
      // El ADMIN ve todos: los disponibles arriba y los no disponibles al final
      return [...listado].sort((a, b) => Number(b.disponible) - Number(a.disponible));
    } else {
      // El USUARIO solo ve los que están disponibles
      return listado.filter(p => p.disponible || p.disponible === (true as any));
    }
  });

  ngOnInit() {
    this.productoService.obtenerTodos();
  }

  esAdmin(): boolean {
    return this.authService.currentUser()?.roles.includes('ADMIN') || false;
  }

  agregarAlCarrito(producto: any) {
    this.carritoService.agregarProducto(producto);
  }

  toggleDisponibilidad(producto: any) {
    const nuevoEstado = !producto.disponible;
    // Clonamos el producto con el nuevo estado
    const productoActualizado = { ...producto, disponible: nuevoEstado };

    this.productoService.actualizar(producto.id, productoActualizado).subscribe({
      next: () => {
        // Refrescamos la lista para que el signal 'productos' se actualice
        this.productoService.obtenerTodos();
      },
      error: (err) => console.error("Error al cambiar disponibilidad:", err)
    });
  }
}
