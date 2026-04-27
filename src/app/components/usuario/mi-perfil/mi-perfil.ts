import { Component, OnInit, inject, signal } from '@angular/core';
import { UsuarioService } from '../../../service/usuario.service';
import { AuthService } from '../../../service/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mi-perfil.html',
})
export class MiPerfilComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);

  usuario = signal<Usuario | null>(null);
  nuevaPassword = signal<string>(''); // Nueva señal para el campo

  ngOnInit() {
    // 1. Ahora getEmail() ya existe
    const emailSesion = this.authService.getEmail();

    if (emailSesion) {
      // 2. Ahora llamamos al nuevo método obtenerPorEmail
      // 3. Tipamos (data: Usuario) y (err: any) para evitar errores de compilación
      this.usuarioService.obtenerPorEmail(emailSesion).subscribe({
        next: (data: Usuario) => this.usuario.set(data),
        error: (err: any) => console.error('Error al cargar perfil', err),
      });
    }
  }

  actualizarPerfil() {
    const u = this.usuario();
    if (!u) return;

    this.usuarioService.actualizar(u.id, u).subscribe({
      next: () => {
        // En lugar de un alert feo, podrías usar un flag para mostrar un mensaje en el HTML
        alert('¡Perfil actualizado con éxito!');
      },
      error: (err) => alert('Hubo un error al guardar los cambios'),
    });
  }

  actualizarPassword() {
    const u = this.usuario();
    if (!u || !this.nuevaPassword()) return;

    if (this.nuevaPassword().length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (confirm('¿Estás seguro? Se cerrará tu sesión por seguridad.')) {
      this.usuarioService.cambiarPassword(u.id, this.nuevaPassword()).subscribe({
        next: () => {
          alert('Contraseña actualizada. Por favor, inicia sesión de nuevo.');
          this.authService.logout(); // Cerramos sesión
          // El logout ya debería redirigir a login o productos según tu lógica
        },
        error: () => alert('Error al cambiar la contraseña'),
      });
    }
  }
}
