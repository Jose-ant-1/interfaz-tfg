import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: 'login.component.html'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';

  onSubmit() {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        console.log('¡Login con éxito! Token recibido:', res.token);
        // Aquí podrías redirigir a /catalogo más adelante
        alert('¡Login con éxito!');
        console.log('Datos recibidos:', res);
      },
      error: (err) => {
        console.error('Error en el login:', err);
        alert('Credenciales incorrectas o servidor caído');
      }
    });
  }
}
