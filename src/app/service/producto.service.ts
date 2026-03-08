import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private http = inject(HttpClient); // Nueva forma en Angular 21
  private apiUrl = 'http://localhost:8080/api/productos';

  // Usamos SIGNALS (lo último de Angular 21) para el estado
  productos = signal<any[]>([]);

  obtenerTodos(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(data => {
      this.productos.set(data); // Actualizamos el signal
    });
  }
}
