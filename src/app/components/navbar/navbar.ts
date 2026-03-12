import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink], // Para poder usar [routerLink] en el HTML
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  // Inyectamos servicios
  public authService = inject(AuthService);
  private router = inject(Router);

  onLogout() {
    this.authService.logout(); // Esto borra el token y limpia el signal
    this.router.navigate(['/login']); // Redirigimos al login
  }
}
