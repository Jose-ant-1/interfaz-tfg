import { Component, OnInit, inject, signal } from '@angular/core'; // Añadido signal
import { UsuarioService } from '../../../service/usuario.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-usuario-lista',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './usuario-lista.html',
})
export class UsuarioListaComponent implements OnInit {
  public usuarioService = inject(UsuarioService);

  // Nuevo: para controlar qué fila está expandida
  idUsuarioExpandido = signal<number | null>(null);

  ngOnInit() {
    this.usuarioService.obtenerTodos();
  }

  // Nuevo: método para expandir/contraer
  toggleFila(id: number) {
    this.idUsuarioExpandido.set(this.idUsuarioExpandido() === id ? null : id);
  }

  borrarUsuario(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      this.usuarioService.eliminar(id).subscribe(() => {
        this.usuarioService.obtenerTodos();
      });
    }
  }
}
