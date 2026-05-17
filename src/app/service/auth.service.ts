import {Injectable, inject, signal, Injector} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {tap} from 'rxjs';
import {LoginResponse} from '../models/auth.model';
import {CarritoService} from './carrito.service';
import {environment} from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private injector = inject(Injector);
  private readonly AUTH_URL = `${environment.apiUrl}/auth`;
  currentUser = signal<LoginResponse | null>(null);

  constructor() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user_data');

    if (token && userData) {
      try {
        this.currentUser.set(JSON.parse(userData));
      } catch (e) {
        this.logout();
      }
    }
  }

  login(credentials: { email: string; password: string }) {
    return this.http.post<LoginResponse>(`${this.AUTH_URL}/login`, credentials).pipe(
      tap((res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user_data', JSON.stringify(res));

        // Al hacer set aquí, el 'effect' del CarritoService se activará solo
        this.currentUser.set(res);

        // Sincronizamos lo que había en local
        this.sincronizarCarritoTrasLogin();
      }),
    );
  }

  private sincronizarCarritoTrasLogin() {
    const localCart = localStorage.getItem('carrito_local');
    if (localCart) {
      const items = JSON.parse(localCart);
      const carritoService = this.injector.get(CarritoService);

      if (items.length > 0) {
        items.forEach((item: any) => {
          // pasar item.cantidad para no perderla
          carritoService.agregarProducto(item, item.cantidad);
        });
      }
      // Borramos el rastro local
      localStorage.removeItem('carrito_local');
    }
  }

  logout() {
    // Limpiamos las credenciales
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');

    // Limpiamos el carrito local por precaución
    localStorage.removeItem('carrito_local');

    // Notificamos al sistema que ya no hay usuario
    this.currentUser.set(null);

    // Limpiar el estado visual del CarritoService
    // Obtenemos el servicio a través del injector para evitar dependencias circulares
    const carritoService = this.injector.get(CarritoService);
    carritoService.limpiarEstadoCapaVisual();
  }

  getEmail(): string | null {
    return this.currentUser()?.email || null;
  }

  registro(datos: any) {
    return this.http.post(`${this.AUTH_URL}/register`, datos, {
      responseType: 'text', // Ponemos esto porque el servidor devuelve un String, no un JSON
    });
  }
}
