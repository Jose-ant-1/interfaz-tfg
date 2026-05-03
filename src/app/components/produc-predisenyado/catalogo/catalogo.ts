import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para Pipes y NgClass
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

  // Lógica de visualización: Admin ve todos (ordenados), Usuario solo disponibles
  productosOrdenados = computed(() => {
    const listado = this.productosBase(); // Esto reacciona a cualquier cambio

    if (this.esAdmin()) {
      // El ADMIN ve todos: los "1" arriba y los "0" al final[cite: 22]
      return [...listado].sort((a, b) => Number(b.disponible) - Number(a.disponible));
    } else {
      // El USUARIO solo ve los que tienen 1 (true)[cite: 22]
      return listado.filter(p => p.disponible || p.disponible === (true as any));
    }
  });

  ngOnInit() {
    this.productoService.obtenerTodos();
  }

  borrarProducto(id: number | undefined) {
    const producto = this.productosBase().find(p => p.id === id);
    if (producto && confirm('¿Deseas marcar este producto como NO DISPONIBLE?')) {
      const actualizado = { ...producto, disponible: false };

      // USAMOS ACTUALIZAR (PUT) PARA QUE EL CAMBIO PERSISTA[cite: 20]
      this.productoService.actualizar(id!, actualizado).subscribe({
        next: () => {
          // IMPORTANTE: Refrescar la lista para que el computed se ejecute de nuevo[cite: 20]
          this.productoService.obtenerTodos();
        },
        error: (err) => console.error("Error:", err)
      });
    }
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

    // Usamos el método ACTUALIZAR del servicio (PUT), no el de eliminar
    this.productoService.actualizar(producto.id, productoActualizado).subscribe({
      next: () => {
        // Refrescamos la lista para que el signal 'productos' se actualice
        this.productoService.obtenerTodos();
      },
      error: (err) => console.error("Error al cambiar disponibilidad:", err)
    });
  }
}
