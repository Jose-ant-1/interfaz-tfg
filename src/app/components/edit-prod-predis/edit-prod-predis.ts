import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProdPredService } from '../../service/prod.predis.service';
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

  // Signal que contendrá el producto a editar
  producto = signal<any>(null);

// En edit-prod-predis.ts
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nuevo') {
      this.prodService.obtenerPorId(+id).subscribe(data => this.producto.set(data));
    } else {
      this.producto.set({
        nombreProducto: '',
        descripcion: '',
        precio: 0,
        stockDisponible: 0,
        dimensiones: '',      // Añadido
        pesoGramos: 0,
        tiempoImpresionMinutos: 0,
        idCategoria: 1,
        caracteristicas: '',  // Añadido
        destacado: false,     // Añadido (es un boolean en Java)
        disponible: true,
        material: null,       // Añadido para evitar undefined
        tecnologia: null      // Añadido para evitar undefined
      });
    }
  }

  guardarCambios() {
    const p = { ...this.producto() };

    // SI ES NUEVO, FORZAMOS EL ID A 0 (No lo borres, no lo dejes null)
    if (!p.id) {
      p.id = 0;
    }

    // Aseguramos el resto de campos primitivos
    p.idCategoria = Number(p.idCategoria) || 1;
    p.tiempoImpresionMinutos = Number(p.tiempoImpresionMinutos) || 0;
    p.stockDisponible = Number(p.stockDisponible) || 0;
    p.precio = Number(p.precio) || 0;
    p.pesoGramos = Number(p.pesoGramos) || 0;

    console.log("JSON con ID 0:", JSON.stringify(p));

    const peticion = p.id === 0
      ? this.prodService.crear(p)
      : this.prodService.actualizar(p.id, p);

    peticion.subscribe({
      next: () => {
        alert('¡Conseguido!');
        this.router.navigate(['/productos']);
      },
      error: (err) => console.error("Error:", err)
    });
  }

}
