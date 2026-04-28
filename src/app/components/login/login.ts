import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../../service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  imports: [FormsModule, RouterLink],
  styleUrls: ['./login.css'],
})
export class Login {
  email = '';
  password = '';
  errorMessage: string | null = null; // Variable para el mensaje de error

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  onSubmit() {
    this.errorMessage = null; // Limpiar errores previos al intentar de nuevo

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/productos']);
      },
      error: (err) => {
        console.error('Error en login', err);

        // Manejo de errores específicos
        if (err.status === 403) {
          this.errorMessage = 'Tu cuenta está inactiva. Por favor, contacta con un administrador.';
        } else if (err.status === 401) {
          this.errorMessage = 'Credenciales incorrectas. Inténtalo de nuevo.';
        } else {
          this.errorMessage = 'Ha ocurrido un error en el servidor. Inténtalo más tarde.';
        }
      },
    });
  }
}
