import { Component, OnInit, inject } from '@angular/core';
import { UsuarioService } from '../../../service/usuario.service';
import { CommonModule } from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-usuario-lista',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './usuario-lista.html'
})
export class UsuarioListaComponent implements OnInit {
  public usuarioService = inject(UsuarioService);

  ngOnInit() {
    this.usuarioService.obtenerTodos();
  }

  borrarUsuario(id: number) {
    if(confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      this.usuarioService.eliminar(id).subscribe(() => {
        this.usuarioService.obtenerTodos();
      });
    }
  }
}
