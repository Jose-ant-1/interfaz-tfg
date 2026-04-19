import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Pedido } from '../models/pedido.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/pedidos';

  pedidos = signal<Pedido[]>([]);

  obtenerTodos(): void {
    this.http.get<Pedido[]>(this.apiUrl).subscribe(data => {
      this.pedidos.set(data);
    });
  }

  actualizarEstado(id: number, nuevoEstado: string) {
    return this.http.patch(`${this.apiUrl}/${id}/estado`, { estado: nuevoEstado });
  }

  getMisPedidos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mis-pedidos`);
  }

}
