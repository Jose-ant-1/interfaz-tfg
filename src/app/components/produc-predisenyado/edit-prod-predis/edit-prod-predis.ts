import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProdPredService } from '../../../service/prod.predis.service';
import { AdminConfigService } from '../../../service/configuracion.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-prod-predis',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit-prod-predis.html'
})
export class EditProdPredis implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private prodService = inject(ProdPredService);
  private configService = inject(AdminConfigService);

  producto = signal<any>(null);
  materiales = signal<any[]>([]);
  tecnologias = signal<any[]>([]);

  ngOnInit() {
    this.configService.getMateriales().subscribe(data => this.materiales.set(data));
    this.configService.getTecnologias().subscribe(data => this.tecnologias.set(data));

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.prodService.obtenerPorId(id).subscribe({
        next: (data) => this.producto.set({ ...data }),
        error: () => this.router.navigate(['/productos'])
      });
    }
  }

  // Comparador para los <select>
  compareObjects(o1: any, o2: any): boolean {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }

  guardarCambios() {
    const p = { ...this.producto() };

    // 1. Conversión de Tipos Numéricos (Crucial para evitar Error 400)
    p.precio = Number(p.precio);
    p.stockDisponible = Number(p.stockDisponible);
    p.pesoGramos = Number(p.pesoGramos);
    p.tiempoImpresionMinutos = Number(p.tiempoImpresionMinutos);

    // 2. Limpieza de campos que JPA genera automáticamente
    delete p.fechaCreacion;
    delete p.fechaActualizacion;

    // 3. Validación de integridad de objetos
    if (p.material && !p.material.id) p.material = null;
    if (p.tecnologia && !p.tecnologia.id) p.tecnologia = null;

    this.prodService.actualizar(p.id, p).subscribe({
      next: () => {
        console.log("Producto actualizado con éxito");
        this.router.navigate(['/productos', p.id]);
      },
      error: (err) => {
        console.error("Error 400 o similar:", err);
        alert("Error al guardar. Revisa la consola.");
      }
    });
  }
}
