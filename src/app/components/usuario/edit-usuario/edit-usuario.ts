import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../../service/usuario.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-edit-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit-usuario.html',
})
export class EditUsuarioComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private usuarioService = inject(UsuarioService);

  usuario = signal<Usuario | null>(null);
  mensajeFeedback = signal<{ texto: string; tipo: 'success' | 'error' } | null>(null);


  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id && id !== 'nuevo') {
      // MODO EDICIÓN
      this.usuarioService.obtenerPorId(+id).subscribe({
        next: (data) => {
          // Limpiamos la contraseña del objeto local
          data.contrasenia = '';
          this.usuario.set(data);
        },
        error: (err) => console.error('Error al cargar', err),
      });
    } else {
      // MODO CREACIÓN: Inicializamos con valores por defecto
      this.usuario.set({
        id: 0, // ID 0 para que Jackson no de error
        email: '',
        nombre: '',
        apellidos: '',
        contrasenia: '',
        telefono: '',
        direccion: '',
        ciudad: '',
        codigoPostal: 0,
        rol: 'CLIENTE',
        estado: 'ACTIVO',
      });
    }
  }

  guardar() {
    const u = this.usuario();
    if (!u) return;

    this.mensajeFeedback.set(null);

    // Validación de contraseña
    if (u.id !== 0 && u.contrasenia && u.contrasenia.length > 0 && u.contrasenia.length < 4) {
      this.mostrarFeedback('La nueva contraseña debe tener al menos 4 caracteres.', 'error');
      return;
    }

    const peticion = u.id === 0 ?
      this.usuarioService.crear(u) :
      this.usuarioService.actualizar(u.id, u);

    peticion.subscribe({
      next: () => {
        this.mostrarFeedback('Usuario guardado con éxito', 'success');
        // Redirigimos tras un breve delay para que vean el mensaje
        setTimeout(() => this.router.navigate(['/admin/usuarios']), 1500);
      },
      error: (err) => {
        console.error(err);
        this.mostrarFeedback('Error al guardar el usuario. Revisa los datos.', 'error');
      }
    });
  }

  mostrarFeedback(texto: string, tipo: 'success' | 'error') {
    this.mensajeFeedback.set({ texto, tipo });
    // Solo ocultamos automáticamente si es un error; el éxito redirige
    if (tipo === 'error') {
      setTimeout(() => this.mensajeFeedback.set(null), 3000);
    }
  }

}
