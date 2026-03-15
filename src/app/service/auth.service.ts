import {Injectable, inject, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {tap} from 'rxjs';
import {LoginResponse} from '../models/auth.model';

@Injectable({providedIn: 'root'})
export class AuthService {
  private http = inject(HttpClient);
  private readonly AUTH_URL = 'http://localhost:8080/api/auth';

  currentUser = signal<LoginResponse | null>(null);

  constructor() {
    const token = localStorage.getItem('token');
    const nombre = localStorage.getItem('user_name'); // Recuperamos el nombre guardado

    if (token) {
      // Reconstruimos el objeto con el nombre para que el Navbar lo vea
      this.currentUser.set({
        token,
        nombre: nombre || 'Usuario'
      } as LoginResponse);
    }
  }

  login(credentials: { email: string; password: string }) {
    return this.http.post<LoginResponse>(`${this.AUTH_URL}/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user_name', res.nombre); // Guardamos el nombre específicamente
        this.currentUser.set(res);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user_name'); // Limpiamos al salir
    this.currentUser.set(null);
  }
}
