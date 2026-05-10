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

  mensajeFeedback = signal<{ texto: string; tipo: 'success' | 'error' } | null>(null);

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
    this.mensajeFeedback.set(null);

    // Conversión de Tipos Numéricos
    p.precio = Number(p.precio);
    p.stockDisponible = Number(p.stockDisponible);
    p.pesoGramos = Number(p.pesoGramos);
    p.tiempoImpresionMinutos = Number(p.tiempoImpresionMinutos);

    delete p.fechaCreacion;
    delete p.fechaActualizacion;

    if (p.material && !p.material.id) p.material = null;
    if (p.tecnologia && !p.tecnologia.id) p.tecnologia = null;

    this.prodService.actualizar(p.id, p).subscribe({
      next: () => {
        this.mostrarFeedback('Producto actualizado correctamente', 'success');
        // Redirigimos después de un breve delay para que vean el mensaje
        setTimeout(() => this.router.navigate(['/productos', p.id]), 1500);
      },
      error: (err) => {
        console.error(err);
        this.mostrarFeedback('Error al guardar los cambios. Revisa los datos.', 'error');
      }
    });
  }

  mostrarFeedback(texto: string, tipo: 'success' | 'error') {
    this.mensajeFeedback.set({ texto, tipo });
    if (tipo === 'error') {
      setTimeout(() => this.mensajeFeedback.set(null), 3000);
    }
  }
}
