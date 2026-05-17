import {Injectable, signal, computed, inject, effect} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CarritoModel } from '../models/carrito.model';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';
import {forkJoin} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CarritoService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private API_URL = `${environment.apiUrl}/carrito`;

  private _items = signal<CarritoModel[]>([]);
  public items = this._items.asReadonly();

  public totalProductos = computed(() =>
    this._items().reduce((acc, item) => acc + item.cantidad, 0),
  );

  public precioTotal = computed(() =>
    this._items().reduce((acc, item) => acc + item.precio * item.cantidad, 0),
  );

  private sincronizando = false; // Bloqueo para evitar bucles

  constructor() {
    // Carga inicial del local
    const localCart = localStorage.getItem('carrito_local');
    if (localCart) {
      this._items.set(JSON.parse(localCart));
    }

    effect(() => {
      const usuario = this.authService.currentUser();
      // Solo intentamos sincronizar si hay un usuario real y el storage NO está vacío
      const rawData = localStorage.getItem('carrito_local');

      if (usuario && rawData) {
        const items = JSON.parse(rawData);
        if (items.length > 0 && !this.sincronizando) {
          this.sincronizarCarritoLocalAlServidor(items);
        }
      }
    });
  }

  private sincronizarCarritoLocalAlServidor(itemsLocales: CarritoModel[]) {
    if (this.sincronizando) return;
    this.sincronizando = true;

    // Vaciamos el servidor para que no sume lo anónimo a lo que ya hubiera en la cuenta
    this.http.delete(`${this.API_URL}/limpiar`).subscribe({
      next: () => {
        // Una vez limpio el servidor, procedemos con la subida
        localStorage.removeItem('carrito_local');
        this._items.set([]);

        const peticiones = itemsLocales.map(item => {
          const pId = item.productoId || item.id;
          return this.http.post(`${this.API_URL}/add/${pId}?cantidad=${item.cantidad}`, {});
        });

        forkJoin(peticiones).subscribe({
          next: () => {
            this.cargarCarritoDesdeServidor();
          },
          complete: () => {
            setTimeout(() => this.sincronizando = false, 1500);
          }
        });
      },
      error: (err) => {
        console.error('Error al limpiar antes de sincronizar', err);
        this.sincronizando = false;
      }
    });
  }

  agregarProducto(producto: any, cantidadSolicitada: number = 1) {
    const usuario = this.authService.currentUser();

    if (usuario) {
      // Si hay usuario, enviamos la cantidad real al servidor
      const pId = producto.productoId || producto.id;

      this.http.post(`${this.API_URL}/add/${pId}?cantidad=${cantidadSolicitada}`, {}).subscribe({
        next: () => this.cargarCarritoDesdeServidor(),
        error: (err) => console.error('Error al sincronizar cantidad:', err),
      });
    } else {
      // Si es anónimo, la lógica de localStorage
      this.actualizarEstadoLocal(producto, cantidadSolicitada);
    }
  }

  decrementarProducto(idProducto: number) {
    const usuario = this.authService.currentUser();

    if (usuario) {
      if (!idProducto) {
        console.error('Error: Se intentó restar un producto sin ID válido');
        return;
      }

      this.http.post(`${this.API_URL}/add/${idProducto}?cantidad=-1`, {}).subscribe({
        next: () => this.cargarCarritoDesdeServidor(),
        error: (err) => console.error('Error al restar producto:', err),
      });
    } else {
      this.actualizarEstadoLocal({ id: idProducto }, -1);
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

          // REEMPLAZO TOTAL: No usamos update, usamos set para machacar lo viejo
          this._items.set(itemsMapeados);

          // Sincronizamos el localstorage para que coincida con la "verdad" del servidor
          localStorage.setItem('carrito_local', JSON.stringify(itemsMapeados));
        }
      },
    });
  }

  limpiarEstadoCapaVisual() {
    this._items.set([]);
  }

  limpiarCarrito() {
    const usuario = this.authService.currentUser();

    // Limpiamos SIEMPRE el rastro local (LocalStorage y Signal)
    this._items.set([]);
    localStorage.removeItem('carrito_local');

    // Si hay un usuario logueado, avisamos al servidor para que limpie la BD
    if (usuario) {
      this.http.delete(`${this.API_URL}/limpiar`).subscribe({
        next: () => {
          console.log('Servidor: Carrito vaciado con éxito');
          // No hace falta llamar a cargarCarritoDesdeServidor porque ya pusimos [] arriba
        },
        error: (err) => {
          console.error('Error al limpiar el carrito en el servidor:', err);
        },
      });
    }
  }
}
