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

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id && id !== 'nuevo') {
      // MODO EDICIÓN
      this.usuarioService.obtenerPorId(+id).subscribe({
        next: (data) => {
          // IMPORTANTE: Limpiamos la contraseña del objeto local
          // para que el input empiece vacío y no enviemos el hash actual.
          data.contrasenia = '';
          this.usuario.set(data);
        },
        error: (err) => console.error('Error al cargar', err),
      });
    } else {
      // MODO CREACIÓN: Inicializamos con valores por defecto
      this.usuario.set({
        id: 0, // Importante: ID 0 para que Jackson no de error
        email: '',
        nombre: '',
        apellidos: '',
        contrasenia: '', // ¡Necesario para el POST!
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

    // Validamos longitud solo si el usuario escribió algo en el campo de edición
    if (u.id !== 0 && u.contrasenia && u.contrasenia.length > 0 && u.contrasenia.length < 4) {
      alert('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }

    // Ahora 'actualizar' enviará el objeto con la contraseña nueva o vacía
    // y el cambio que hicimos en el Backend (Paso 1) decidirá qué hacer.[cite: 59, 61]
    const peticion = u.id === 0 ?
      this.usuarioService.crear(u) :
      this.usuarioService.actualizar(u.id, u);

    peticion.subscribe({
      next: () => {
        alert('Usuario guardado con éxito');
        this.router.navigate(['/admin/usuarios']);
      },
      error: (err) => alert('Error al guardar')
    });
  }

}
