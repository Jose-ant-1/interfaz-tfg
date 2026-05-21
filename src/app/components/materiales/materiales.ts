import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminConfigService } from '../../service/configuracion.service';
import { AuthService } from '../../service/auth.service';
import { Material } from '../../models/configuracion.model';

@Component({
  selector: 'app-admin-materiales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './materiales.html',
})
export class AdminMaterialesComponent implements OnInit {
  private configService = inject(AdminConfigService);
  public authService = inject(AuthService);

  materiales = signal<Material[]>([]);
  idFilaExpandida = signal<number | null>(null);
  errorMessage = signal<string | null>(null);

  nuevoMaterial: Material = this.resetForm();
  editando = false; // Flag para saber si estamos editando

  esAdmin(): boolean {
    return this.authService.currentUser()?.roles.includes('ADMIN') || false;
  }

  ngOnInit() {
    this.cargarMateriales();
  }

  toggleFila(id: number | undefined) {
    if (!id) return;
    this.idFilaExpandida.set(this.idFilaExpandida() === id ? null : id);
  }

  cargarMateriales() {
    this.configService.getMateriales().subscribe((res) => this.materiales.set(res));
  }

  // Carga un material en el formulario para editarlo
  seleccionarParaEditar(m: Material) {
    if (!this.esAdmin()) return;
    this.editando = true;
    this.nuevoMaterial = { ...m }; // Copia para no modificar la lista original antes de tiempo
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Sube al formulario
  }

  cancelarEdicion() {
    this.editando = false;
    this.errorMessage.set(null);
    this.nuevoMaterial = this.resetForm();
  }

  guardar() {
    // Resetear mensaje de error al intentar guardar
    this.errorMessage.set(null);

    // Validación manual
    if (!this.nuevoMaterial.nombreMaterial || this.nuevoMaterial.precioPorGramo <= 0) {
      this.errorMessage.set('El nombre y un precio mayor a 0 son obligatorios.');
      return;
    }

    const datosAEnviar = {
      ...this.nuevoMaterial,
      precioPorGramo: Number(this.nuevoMaterial.precioPorGramo),
      stockGramo: Number(this.nuevoMaterial.stockGramo),
    };

    const observer = {
      next: () => {
        this.cargarMateriales();
        this.cancelarEdicion();
      },
      error: (err: any) => {
        console.error(err);
        this.errorMessage.set('Error al conectar con el servidor. Revisa los datos.');
      }
    };

    if (this.editando && this.nuevoMaterial.id) {
      this.configService.updateMaterial(this.nuevoMaterial.id, datosAEnviar).subscribe(observer);
    } else {
      this.configService.saveMaterial(datosAEnviar).subscribe(observer);
    }
  }


  private resetForm(): Material {
    this.editando = false;
    return {
      nombreMaterial: '',
      tipo: 'Filamento',
      descripcion: '',
      color: '',
      precioPorGramo: 0,
      stockGramo: 0,
      propiedades: '',
      disponible: true, // Por defecto disponible
    };
  }
}
