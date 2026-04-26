import {Injectable, signal, computed, inject, effect} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CarritoModel } from '../models/carrito.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class CarritoService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly API_URL = 'http://localhost:8080/api/carrito';

  private _items = signal<CarritoModel[]>([]);
  public items = this._items.asReadonly();

  public totalProductos = computed(() =>
    this._items().reduce((acc, item) => acc + item.cantidad, 0),
  );

  public precioTotal = computed(() =>
    this._items().reduce((acc, item) => acc + item.precio * item.cantidad, 0),
  );

  constructor() {
    // 1. Cargar local siempre al arrancar (para anónimos)
    const localCart = localStorage.getItem('carrito_local');
    if (localCart) {
      this._items.set(JSON.parse(localCart));
    }

    // 2. EFECTO REACTIVO: Se ejecutará cada vez que authService.currentUser cambie
    effect(() => {
      const usuario = this.authService.currentUser();
      if (usuario) {
        console.log('Detectado usuario logueado, cargando carrito del servidor...');
        this.cargarCarritoDesdeServidor();
      }
    });
  }

  agregarProducto(producto: any, cantidadSolicitada: number = 1) {
    const usuario = this.authService.currentUser();

    if (usuario) {
      // Si hay usuario, enviamos la cantidad real al servidor
      const pId = producto.productoId || producto.id;

      // Tu endpoint de Spring /api/carrito/add/{id}?cantidad=X
      this.http.post(`${this.API_URL}/add/${pId}?cantidad=${cantidadSolicitada}`, {}).subscribe({
        next: () => this.cargarCarritoDesdeServidor(),
        error: (err) => console.error('Error al sincronizar cantidad:', err),
      });
    } else {
      // Si es anónimo, la lógica de localStorage (que ya deberías tener)
      this.actualizarEstadoLocal(producto, cantidadSolicitada);
    }
  }

  decrementarProducto(idProducto: number) {
    const usuario = this.authService.currentUser();

    if (usuario) {
      if (!idProducto) {
        console.error("Error: Se intentó restar un producto sin ID válido");
        return;
      }

      this.http.post(`${this.API_URL}/add/${idProducto}?cantidad=-1`, {}).subscribe({
        next: () => this.cargarCarritoDesdeServidor(),
        error: (err) => console.error('Error al restar producto:', err),
      });
    } else {
      // ... tu lógica de localStorage actual ...
    }
  }

  private actualizarEstadoLocal(producto: any, cambio: number) {
    this._items.update((items) => {
      const pId = producto.productoId || producto.id;
      const index = items.findIndex((i) => (i.productoId || i.id) === pId);
      let nuevoCarrito;

      if (index !== -1) {
        nuevoCarrito = [...items];
        const nuevaCantidad = nuevoCarrito[index].cantidad + cambio;

        if (nuevaCantidad <= 0) {
          nuevoCarrito.splice(index, 1);
        } else {
          nuevoCarrito[index] = { ...nuevoCarrito[index], cantidad: nuevaCantidad };
        }
      } else if (cambio > 0) {
        nuevoCarrito = [
          ...items,
          {
            id: pId,
            productoId: pId,
            nombre: producto.nombreProducto || producto.nombre,
            precio: producto.precio,
            cantidad: 1,
            imagenUrl: producto.imagenUrl,
          },
        ];
      } else {
        return items;
      }

      localStorage.setItem('carrito_local', JSON.stringify(nuevoCarrito));
      return nuevoCarrito;
    });
  }

  cargarCarritoDesdeServidor() {
    if (!localStorage.getItem('token')) return;

    this.http.get<any>(this.API_URL).subscribe({
      next: (res) => {
        if (res && res.elementos) {
          const itemsMapeados = res.elementos.map((e: any) => ({
            id: e.id,
            productoId: e.producto?.id,
            nombre: e.producto?.nombreProducto || 'Producto',
            precio: e.precioUnitario,
            cantidad: e.cantidad,
            imagenUrl: e.producto?.imagenUrl || 'assets/placeholder.png',
          }));
          this._items.set(itemsMapeados);
          // Opcional: mantener sincronizado el local incluso logueado
          localStorage.setItem('carrito_local', JSON.stringify(itemsMapeados));
        }
      },
    });
  }

  quitarProducto(id: number) {
    const usuario = this.authService.currentUser();
    if (usuario) {
      this.http.delete(`${this.API_URL}/item/${id}`).subscribe({
        next: () => this.cargarCarritoDesdeServidor(),
      });
    } else {
      this._items.update((items) => {
        const nuevo = items.filter((i) => i.id !== id);
        localStorage.setItem('carrito_local', JSON.stringify(nuevo));
        return nuevo;
      });
    }
  }

  limpiarEstadoCapaVisual() {
    this._items.set([]);
  }

  limpiarCarrito() {
    this._items.set([]);
    localStorage.removeItem('carrito_local');
  }
}
