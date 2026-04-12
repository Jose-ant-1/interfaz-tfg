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
    const userData = localStorage.getItem('user_data'); // Usamos una clave para todo el objeto

    if (token && userData) {
      try {
        // Recuperamos el objeto completo que incluye los ROLES
        this.currentUser.set(JSON.parse(userData));
      } catch (e) {
        this.logout();
      }
    }
  }

  login(credentials: { email: string; password: string }) {
    return this.http.post<LoginResponse>(`${this.AUTH_URL}/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        // GUARDAMOS EL OBJETO COMPLETO COMO STRING
        localStorage.setItem('user_data', JSON.stringify(res));
        this.currentUser.set(res);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data'); // Limpiamos la nueva clave
    this.currentUser.set(null);
  }

  registro(datos: any) {
    return this.http.post(`${this.AUTH_URL}/register`, datos, {
      responseType: 'text' // Ponemos esto porque el servidor devuelve un String, no un JSON
    });
  }

}
