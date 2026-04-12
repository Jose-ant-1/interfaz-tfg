import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/usuarios';

  usuarios = signal<Usuario[]>([]);

  obtenerTodos(): void {
    this.http.get<Usuario[]>(this.apiUrl).subscribe(data => {
      this.usuarios.set(data);
    });
  }

  eliminar(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  obtenerPorId(id: number) {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  actualizar(id: number, usuario: Usuario) {
    return this.http.put(`${this.apiUrl}/${id}`, usuario);
  }

  crear(usuario: Usuario) {
    return this.http.post(this.apiUrl, usuario);
  }

}
