import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../../service/auth.service'; // Importar el Router

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [
    FormsModule
  ],
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';

// Inyecta el AuthService en el constructor
  constructor(private router: Router, private authService: AuthService) {}

  onSubmit() {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/productos']); // Solo redirige si el login fue exitoso
      },
      error: (err) => console.error('Error en login', err)
    });
  }
}
