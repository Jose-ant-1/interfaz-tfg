import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ValoracionModel } from '../models/valoracion.model';

@Injectable({
  providedIn: 'root'
})
export class ValoracionService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/valoraciones';

  // Obtener todas (útil para admin)
  getValoraciones(): Observable<ValoracionModel[]> {
    return this.http.get<ValoracionModel[]>(this.apiUrl);
  }

  // En tu API no lo tienes, pero sería ideal filtrar por producto en el futuro
  // Por ahora usaremos el GetMapping general

  guardarValoracion(valoracion: ValoracionModel): Observable<ValoracionModel> {

    return this.http.post<ValoracionModel>(this.apiUrl, valoracion);
  }

  obtenerPorProducto(productoId: number): Observable<ValoracionModel[]> {
    return this.http.get<ValoracionModel[]>(`${this.apiUrl}/producto/${productoId}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }


}
