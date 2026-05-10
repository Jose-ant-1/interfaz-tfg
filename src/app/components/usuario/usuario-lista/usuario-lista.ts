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
// ... otras importaciones
export class UsuarioListaComponent implements OnInit {
  public usuarioService = inject(UsuarioService);

  idUsuarioExpandido = signal<number | null>(null);

  // Nuevas señales para feedback y confirmación segura
  mensajeFeedback = signal<{ texto: string; tipo: 'success' | 'error' } | null>(null);
  idUsuarioBorrando = signal<number | null>(null);

  ngOnInit() {
    this.usuarioService.obtenerTodos();
  }

  toggleFila(id: number) {
    this.idUsuarioExpandido.set(this.idUsuarioExpandido() === id ? null : id);
  }

  // Activa el modo confirmación en la fila
  prepararBorrado(id: number) {
    this.idUsuarioBorrando.set(id);
  }

  cancelarBorrado() {
    this.idUsuarioBorrando.set(null);
  }

  confirmarBorrado(id: number) {
    this.usuarioService.eliminar(id).subscribe({
      next: () => {
        this.mostrarFeedback('Usuario eliminado correctamente', 'success');
        this.idUsuarioBorrando.set(null);
        this.usuarioService.obtenerTodos();
      },
      error: () => {
        this.mostrarFeedback('No se pudo eliminar el usuario', 'error');
        this.idUsuarioBorrando.set(null);
      }
    });
  }

  private mostrarFeedback(texto: string, tipo: 'success' | 'error') {
    this.mensajeFeedback.set({ texto, tipo });
    setTimeout(() => this.mensajeFeedback.set(null), 3000);
  }
}
