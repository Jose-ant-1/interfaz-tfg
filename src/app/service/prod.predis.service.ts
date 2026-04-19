import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Producto} from '../models/prod.predis.model';

@Injectable({
  providedIn: 'root'
})
export class ProdPredService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/productos';
  productos = signal<Producto[]>([]);

  obtenerTodos(): void {
    this.http.get<Producto[]>(this.apiUrl).subscribe(data => {
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

  eliminar(id: number | undefined): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}
