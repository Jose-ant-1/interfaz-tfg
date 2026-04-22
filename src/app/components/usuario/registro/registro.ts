import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.html'
})
export class RegistroComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Modelo que coincide con lo que espera tu Entidad Usuario en Java
  registroData = {
    nombre: '',
    apellidos: '', // Nuevo
    email: '',
    telefono: '',  // Nuevo
    contrasenia: ''
  };

  onSubmit() {
    this.authService.registro(this.registroData).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        alert('¡Cuenta creada correctamente! Ahora puedes iniciar sesión.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error en registro:', err);
        alert('No se pudo crear la cuenta. Es posible que el email ya esté en uso.');
      }
    });
  }
}
