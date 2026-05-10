import { Component, OnInit, inject, signal } from '@angular/core';
import { UsuarioService } from '../../../service/usuario.service';
import { AuthService } from '../../../service/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../../models/usuario.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mi-perfil.html',
})
export class MiPerfilComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private router = inject(Router);

  usuario = signal<Usuario | null>(null);
  nuevaPassword = signal<string>(''); // Nueva señal para el campo

  mensajeFeedback = signal<{ texto: string; tipo: 'success' | 'error' } | null>(null);
  confirmarCambioPassword = signal(false); // Para sustituir el confirm()

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

    this.mensajeFeedback.set(null);
    const datosAActualizar = { ...u };
    delete datosAActualizar.contrasenia;

    this.usuarioService.actualizar(u.id, datosAActualizar).subscribe({
      next: () => {
        this.mostrarFeedback('¡Perfil actualizado con éxito!', 'success');
      },
      error: () => this.mostrarFeedback('Hubo un error al guardar los cambios', 'error'),
    });
  }

  darDeBaja() {
    const u = this.usuario();
    if (u && u.id) {
      this.usuarioService.darDeBaja(u.id).subscribe({
        next: () => {
          this.mostrarFeedback('Cuenta desactivada. Cerrando sesión...', 'success');
          setTimeout(() => {
            this.authService.logout();
            this.router.navigate(['/productos']);
          }, 2000);
        },
        error: () => this.mostrarFeedback('Error al procesar la baja', 'error')
      });
    }
  }

  actualizarPassword() {
    const u = this.usuario();
    if (!u || !this.nuevaPassword()) return;

    if (this.nuevaPassword().length < 6) {
      this.mostrarFeedback('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    this.usuarioService.cambiarPassword(u.id, this.nuevaPassword()).subscribe({
      next: () => {
        this.mostrarFeedback('Contraseña actualizada. Reiniciando sesión...', 'success');
        // Esperamos 2 segundos para que el usuario lea el mensaje antes del logout
        setTimeout(() => {
          this.authService.logout();
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: () => this.mostrarFeedback('No se pudo actualizar la contraseña', 'error')
    });
  }

  private mostrarFeedback(texto: string, tipo: 'success' | 'error') {
    this.mensajeFeedback.set({ texto, tipo });
    setTimeout(() => this.mensajeFeedback.set(null), 3000);
  }

}
