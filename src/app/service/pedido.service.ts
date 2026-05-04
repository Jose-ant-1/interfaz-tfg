import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Pedido } from '../models/pedido.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/pedidos';

  pedidos = signal<Pedido[]>([]);

  // Obtener todos (Solo Admin)
  obtenerTodos(): void {
    this.http.get<Pedido[]>(this.apiUrl).subscribe((data) => {
      this.pedidos.set(data);
    });
  }

  // NUEVO: Obtener un pedido por ID (Dueño o Admin)
  getPedidoById(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${id}`);
  }

  // Obtener lista del usuario actual
  getMisPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/mis-pedidos`);
  }

  actualizarEstado(id: number, nuevoEstado: string) {
    return this.http.patch(`${this.apiUrl}/${id}/estado`, { estado: nuevoEstado });
  }

  crearPedido(pedido: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, pedido);
  }

  reclamar(id: number, motivo: string) {
    // Enviamos un objeto JSON con el motivo
    return this.http.put(`${this.apiUrl}/${id}/reclamar`, { motivo: motivo });
  }

  confirmarPagoPedido(id: number): Observable<any> {
    // Este endpoint ahora es accesible para usuarios normales (ROLE_USER)[cite: 32]
    return this.http.post(`${this.apiUrl}/${id}/confirmar-pago`, {});
  }

  actualizarEstadoConPrecio(id: number, datos: {estado: string, total: number}) {
    return this.http.patch(`${this.apiUrl}/${id}/estado`, datos);
  }

}
