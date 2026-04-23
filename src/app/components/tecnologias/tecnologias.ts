import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminConfigService } from '../../service/configuracion.service';
import { AuthService } from '../../service/auth.service'; // <--- Añadir este import
import { Tecnologia } from '../../models/configuracion.model';

@Component({
  selector: 'app-admin-tecnologias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tecnologias.html',
})
export class AdminTecnologiasComponent implements OnInit {
  private configService = inject(AdminConfigService);
  public authService = inject(AuthService); // <--- Inyectar para que el HTML lo vea

  tecnologias = signal<Tecnologia[]>([]);
  idFilaExpandida = signal<number | null>(null);
  nuevaTecno: Tecnologia = this.resetForm();
  editando = false;

  ngOnInit() {
    this.cargarTecnologias();
  }

  cargarTecnologias() {
    this.configService.getTecnologias().subscribe((res) => this.tecnologias.set(res));
  }

  toggleFila(id: number | undefined) {
    if (!id) return;
    this.idFilaExpandida.set(this.idFilaExpandida() === id ? null : id);
  }

  // --- MÉTODOS QUE FALTABAN Y CAUSABAN ERRORES ---

  cargarParaEditar(t: Tecnologia) {
    this.editando = true;
    this.nuevaTecno = { ...t }; // Copiamos el objeto para no editar la lista original por error
  }

  cancelarEdicion() {
    this.editando = false;
    this.nuevaTecno = this.resetForm();
  }

  // ----------------------------------------------

  guardar() {
    if (!this.nuevaTecno.nombre) return;

    if (this.editando && this.nuevaTecno.id) {
      // Usamos el mismo save o update según tu service
      this.configService.saveTecnologia(this.nuevaTecno).subscribe({
        next: () => {
          this.cargarTecnologias();
          this.cancelarEdicion();
        },
      });
    } else {
      this.configService.saveTecnologia(this.nuevaTecno).subscribe({
        next: () => {
          this.cargarTecnologias();
          this.nuevaTecno = this.resetForm();
        },
      });
    }
  }

  borrar(id: number | undefined) {
    if (!id || !confirm('¿Eliminar esta tecnología?')) return;
    this.configService.deleteTecnologia(id).subscribe(() => {
      this.tecnologias.update((list) => list.filter((t) => t.id !== id));
    });
  }

  private resetForm(): Tecnologia {
    return {
      nombre: '',
      descripcion: '',
      especificacion: '',
      disponible: true,
    };
  }
}
