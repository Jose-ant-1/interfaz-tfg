import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { LoginResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly AUTH_URL = 'http://localhost:8080/api/auth';

  // Signal para saber en tiempo real si el usuario está logueado
  currentUser = signal<LoginResponse | null>(null);

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
