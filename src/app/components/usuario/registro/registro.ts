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
    // Al enviar, eliminamos los espacios para que el backend reciba solo números
    const telefonoLimpio = this.registroData.telefono.replace(/\s/g, '');

    const dataFinal = {
      nombre: this.registroData.nombre.trim(),
      apellidos: this.registroData.apellidos.trim(),
      email: this.registroData.email.trim(),
      telefono: telefonoLimpio, // Enviamos el teléfono sin espacios
      contrasenia: this.registroData.contrasenia,
    };

    if (!dataFinal.nombre || !dataFinal.apellidos || dataFinal.telefono.length !== 9) {
      alert('Por favor, revisa que todos los campos sean correctos.');
      return;
    }

    this.authService.registro(dataFinal).subscribe({
      next: (response) => {
        this.router.navigate(['/login']);
      },
      error: (err) => console.error(err)
    });
  }
}
