import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Pedido } from '../models/pedido.model';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pedidos`;

  pedidos = signal<Pedido[]>([]);

  // Obtener todos (Solo Admin)
  obtenerTodos(): void {
    this.http.get<Pedido[]>(this.apiUrl).subscribe((data) => {
      this.pedidos.set(data);
    });
  }

  getPedidoById(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${id}`);
  }

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
    return this.http.put(`${this.apiUrl}/${id}/reclamar`, { motivo: motivo });
  }

  confirmarPagoPedido(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/confirmar-pago`, {});
  }

  actualizarEstadoConPrecio(id: number, datos: { estado: string; total: number }) {
    return this.http.patch(`${this.apiUrl}/${id}/estado`, datos);
  }

  actualizarDatosEnvio(id: number, datos: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/actualizar-envio`, datos);
  }
}
