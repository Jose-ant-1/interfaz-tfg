import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminConfigService } from '../../service/configuracion.service';
import { AuthService } from '../../service/auth.service';
import { Tecnologia } from '../../models/configuracion.model';

@Component({
  selector: 'app-admin-tecnologias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tecnologias.html',
})
export class AdminTecnologiasComponent implements OnInit {
  private configService = inject(AdminConfigService);
  public authService = inject(AuthService);

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

  cargarParaEditar(t: Tecnologia) {
    this.editando = true;
    this.nuevaTecno = { ...t };
  }

  cancelarEdicion() {
    this.editando = false;
    this.nuevaTecno = this.resetForm();
  }

  guardar() {
    if (!this.nuevaTecno.nombre) return;

    if (this.editando && this.nuevaTecno.id) {
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

  private resetForm(): Tecnologia {
    return {
      nombre: '',
      descripcion: '',
      especificacion: '',
      disponible: true,
    };
  }
}
