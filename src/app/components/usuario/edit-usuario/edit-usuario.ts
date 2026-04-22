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
  templateUrl: './edit-usuario.html'
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
        next: (data) => this.usuario.set(data),
        error: (err) => console.error("Error al cargar", err)
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
        estado: 'ACTIVO'
      });
    }
  }

  guardar() {
    const u = this.usuario();
    if (!u) return;


    u.codigoPostal = Number(u.codigoPostal) || 0;

    // Si es nuevo, usamos el metodo crear
    const peticion = (u.id === 0)
      ? this.usuarioService.crear(u)
      : this.usuarioService.actualizar(u.id, u);

    peticion.subscribe({
      next: () => {
        alert(u.id === 0 ? 'Usuario creado' : 'Usuario actualizado');
        this.router.navigate(['/admin/usuarios']);
      },
      error: (err) => {
        console.error("Error en la API:", err);
        alert("Error al guardar. Revisa si el email ya existe.");
      }
    });
  }

}
