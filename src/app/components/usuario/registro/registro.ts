import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.html',
})
export class RegistroComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  registroData = {
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    contrasenia: '',
  };

  onSubmit() {
    // 1. Limpieza de datos (Trim)
    const dataFinal = {
      nombre: this.registroData.nombre.trim(),
      apellidos: this.registroData.apellidos.trim(),
      email: this.registroData.email.trim(),
      telefono: this.registroData.telefono.trim(),
      contrasenia: this.registroData.contrasenia,
    };

    // 2. Validación final de seguridad
    if (!dataFinal.nombre || !dataFinal.apellidos || dataFinal.telefono.length !== 9) {
      alert('Por favor, revisa que todos los campos sean correctos.');
      return;
    }

    this.authService.registro(dataFinal).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        alert('¡Cuenta creada correctamente! Ahora puedes iniciar sesión.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error en registro:', err);
        alert('No se pudo crear la cuenta. Es posible que el email ya esté en uso.');
      },
    });
  }
}
