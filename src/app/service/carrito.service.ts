import { Injectable, signal, computed } from '@angular/core';
import { CarritoModel } from '../models/carrito.model'; // Ajusta la ruta a tu model

@Injectable({
  providedIn: 'root',
})
export class CarritoService {
  // 1. El estado privado del carrito (la lista de items)
  private _items = signal<CarritoModel[]>([]);

  // 2. Exponemos la lista como solo lectura para que otros componentes la vean
  public items = this._items.asReadonly();

  // 3. Calculamos el total de productos automáticamente
  // Si el signal _items cambia, esto se recalcula solo
  public totalProductos = computed(() =>
    this._items().reduce((acc, item) => acc + item.cantidad, 0)
  );

  // 4. Calculamos el precio total
  public precioTotal = computed(() =>
    this._items().reduce((acc, item) => acc + (item.precio * item.cantidad), 0)
  );

  agregarProducto(producto: any) {
    this._items.update(items => {
      // ¿Ya está el producto en el carrito?
      const index = items.findIndex(i => i.id === producto.id);

      if (index !== -1) {
        // Si existe, creamos una copia del array con la cantidad aumentada
        const nuevoCarrito = [...items];
        nuevoCarrito[index] = {
          ...nuevoCarrito[index],
          cantidad: nuevoCarrito[index].cantidad + 1
        };
        return nuevoCarrito;
      }

      // Si no existe, lo añadimos con cantidad 1
      return [...items, { ...producto, cantidad: 1 }];
    });
  }

  quitarProducto(id: number) {
    this._items.update(items => items.filter(i => i.id !== id));
  }

  // carrito.service.ts

  decrementarProducto(id: number) {
    this._items.update(items => {
      const index = items.findIndex(i => i.id === id);
      if (index === -1) return items;

      if (items[index].cantidad > 1) {
        // Si hay más de uno, restamos 1
        const nuevoCarrito = [...items];
        nuevoCarrito[index] = {
          ...nuevoCarrito[index],
          cantidad: nuevoCarrito[index].cantidad - 1
        };
        return nuevoCarrito;
      } else {
        // Si solo queda uno y pulsa menos, lo quitamos del carrito
        return items.filter(i => i.id !== id);
      }
    });
  }

  limpiarCarrito() {
    this._items.set([]);
  }
}
