import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProdPredService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/productos';

  productos = signal<any[]>([]);

  obtenerTodos(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(data => {
      this.productos.set(data);
    });
  }

  obtenerPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  actualizar(id: number, producto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, producto);
  }

  crear(producto: any): Observable<any> {
    return this.http.post(this.apiUrl, producto);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}
