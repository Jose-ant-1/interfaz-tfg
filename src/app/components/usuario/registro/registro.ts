import {Component, inject, signal} from '@angular/core';
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

  mensajeError = signal<string | null>(null);

  formatPhone(event: any) {
    let value = event.target.value.replace(/\D/g, ''); // Elimina todo lo que no sea número

    if (value.length > 9) value = value.substring(0, 9); // Limita a 9 dígitos

    // Aplica el formato: 123 45 67 89
    const part1 = value.substring(0, 3);
    const part2 = value.substring(3, 5);
    const part3 = value.substring(5, 7);
    const part4 = value.substring(7, 9);

    if (value.length > 7) {
      value = `${part1} ${part2} ${part3} ${part4}`;
    } else if (value.length > 5) {
      value = `${part1} ${part2} ${part3}`;
    } else if (value.length > 3) {
      value = `${part1} ${part2}`;
    }

    this.registroData.telefono = value;
  }

  onSubmit() {
    this.mensajeError.set(null); // Limpiamos errores previos
    const telefonoLimpio = this.registroData.telefono.replace(/\s/g, '');

    const dataFinal = {
      nombre: this.registroData.nombre.trim(),
      apellidos: this.registroData.apellidos.trim(),
      email: this.registroData.email.trim(),
      telefono: telefonoLimpio,
      contrasenia: this.registroData.contrasenia,
    };

    // Validaciones manuales antes de enviar
    if (dataFinal.telefono.length !== 9) {
      this.mensajeError.set('El teléfono debe tener 9 dígitos exactos.');
      return;
    }

    this.authService.registro(dataFinal).subscribe({
      next: (response) => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        // Si el backend devuelve un error (ej: email ya existe), lo mostramos
        this.mensajeError.set('No se pudo crear la cuenta. Es posible que el correo ya esté registrado.');
      }
    });
  }
}
