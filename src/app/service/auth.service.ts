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
    if (token) {
      // Para simplificar ahora, creamos un objeto mínimo
      // indicando que el usuario está logueado
      this.currentUser.set({ token } as any);
    }
  }

  login(credentials: { email: string; password: string }) {
    return this.http.post<LoginResponse>(`${this.AUTH_URL}/login`, credentials).pipe(
      tap(res => {
        // Guardamos el token en el navegador
        localStorage.setItem('token', res.token);
        // Actualizamos el signal con los datos del usuario
        this.currentUser.set(res);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUser.set(null);
  }
}
