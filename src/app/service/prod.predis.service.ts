// [source: 26] - ProdPredService.ts (Código corregido)
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/prod.predis.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProdPredService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/productos`;

  // Guardará TODOS los productos (disponibles y no disponibles)
  productos = signal<Producto[]>([]);

  obtenerTodos(): void {
    this.http.get<Producto[]>(this.apiUrl).subscribe((data) => {
      // Guardamos la respuesta tal cual viene de la base de datos
      this.productos.set(data);
    });
  }

  obtenerPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  actualizar(id: number, producto: Producto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, producto);
  }

  crear(producto: Producto): Observable<any> {
    return this.http.post(this.apiUrl, producto);
  }
}
