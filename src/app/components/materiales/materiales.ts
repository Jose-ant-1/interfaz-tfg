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
  templateUrl: './materiales.html'
})
export class AdminMaterialesComponent implements OnInit {
  private configService = inject(AdminConfigService);
  public authService = inject(AuthService);

  materiales = signal<Material[]>([]);

  // Objeto para el formulario
  nuevoMaterial: Material = this.resetForm();
  editando = false; // Flag para saber si estamos editando

  esAdmin(): boolean {
    return this.authService.currentUser()?.roles.includes('ADMIN') || false;
  }

  ngOnInit() {
    this.cargarMateriales();
  }

  cargarMateriales() {
    this.configService.getMateriales().subscribe(res => this.materiales.set(res));
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
    this.nuevoMaterial = this.resetForm();
  }

  guardar() {
    // Validamos que los números sean efectivamente números
    if (!this.nuevoMaterial.nombreMaterial || this.nuevoMaterial.precioPorGramo < 0) {
      alert("Revisa los datos obligatorios");
      return;
    }

    // Creamos una copia limpia para enviar
    const datosAEnviar = {
      ...this.nuevoMaterial,
      // Forzamos que sean números por si el input los dejó como string
      precioPorGramo: Number(this.nuevoMaterial.precioPorGramo),
      stockGramo: Number(this.nuevoMaterial.stockGramo)
    };

    if (this.editando && this.nuevoMaterial.id) {
      this.configService.updateMaterial(this.nuevoMaterial.id, datosAEnviar).subscribe({
        next: () => { this.cargarMateriales(); this.cancelarEdicion(); },
        error: (err) => console.error("Error 400 - Verifica los campos:", err)
      });
    } else {
      this.configService.saveMaterial(datosAEnviar).subscribe({
        next: () => { this.cargarMateriales(); this.nuevoMaterial = this.resetForm(); },
        error: (err) => console.error("Error 400 - Verifica los campos:", err)
      });
    }
  }

  borrar(id: number | undefined) {
    if (!id || !confirm('¿Estás seguro de que deseas eliminar este material?')) return;
    this.configService.deleteMaterial(id).subscribe(() => {
      this.materiales.update(list => list.filter(m => m.id !== id));
    });
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
      propiedades: '', // Inicializar
      imagen: '',      // Inicializar
      disponible: true
    };
  }
}
