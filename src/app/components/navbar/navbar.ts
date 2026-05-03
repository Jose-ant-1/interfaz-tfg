import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { CarritoService } from '../../service/carrito.service';
import { computed } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  public authService = inject(AuthService);
  public carritoService = inject(CarritoService);
  private router = inject(Router);

  totalBadge = computed(() => {
    const total = this.carritoService.totalProductos();
    return total > 99 ? '+99' : total.toString();
  });

  // Función para verificar si es Admin
  esAdmin(): boolean {
    return this.authService.currentUser()?.roles.includes('ADMIN') || false;
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/productos']);
  }
}
