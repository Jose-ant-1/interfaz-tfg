import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Usuario } from '../models/usuario.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/usuarios';

  usuarios = signal<Usuario[]>([]);

  obtenerTodos(): void {
    this.http.get<Usuario[]>(this.apiUrl).subscribe((data) => {
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

  // Dentro de la clase UsuarioService en usuario.service.ts
  obtenerPorEmail(email: string) {
    // Asegúrate de que tu backend tenga este endpoint (GET /api/usuarios/email/{email})
    return this.http.get<Usuario>(`${this.apiUrl}/email/${email}`);
  }

  cambiarPassword(id: number, nuevaPass: string) {
    return this.http.put(`${this.apiUrl}/${id}/password`, nuevaPass, { responseType: 'text' });
  }

  crear(usuario: Usuario) {
    return this.http.post(this.apiUrl, usuario);
  }

  darDeBaja(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/baja`, {});
  }

}
