import {Component, OnInit, inject, signal} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {ProdPredService} from '../../service/prod.predis.service';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

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

  // Signal que contiene el producto a editar
  producto = signal<any>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nuevo') {
      this.prodService.obtenerPorId(+id).subscribe(data => {
        // Aseguramos que imagenUrl esté presente para el binding
        this.producto.set({ ...data, imagenUrl: data.imagenUrl || '' });
      });
    } else {
      this.producto.set({
        nombreProducto: '',
        descripcion: '',
        precio: 0,
        stockDisponible: 0,
        dimensiones: '',
        pesoGramos: 0,
        tiempoImpresionMinutos: 0,
        idCategoria: 1,
        caracteristicas: '',
        destacado: false,
        disponible: true,
        material: null,
        tecnologia: null,
        imagenUrl: '' // Inicializado vacío para el nuevo producto
      });
    }
  }

  guardarCambios() {
    const p = {...this.producto()};

    if (!p.id) p.id = 0;

    // Normalización de tipos
    p.idCategoria = Number(p.idCategoria) || 1;
    p.precio = Number(p.precio) || 0;
    // Aseguramos que la URL vaya como string vacío si no se pone nada
    p.imagenUrl = p.imagenUrl?.trim() || '';

    const peticion = p.id === 0
      ? this.prodService.crear(p)
      : this.prodService.actualizar(p.id, p);

    peticion.subscribe({
      next: () => {
        alert('Producto guardado correctamente');
        this.router.navigate(['/productos']);
      },
      error: (err) => {
        console.error("Error al guardar:", err);
        alert('Hubo un error al guardar');
      }
    });
  }
}
