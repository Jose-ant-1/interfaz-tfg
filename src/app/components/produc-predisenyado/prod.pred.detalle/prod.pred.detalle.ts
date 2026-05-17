import {Component, OnInit, inject, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {ProdPredService} from '../../../service/prod.predis.service';
import {CommonModule, CurrencyPipe, DatePipe} from '@angular/common';
import {CarritoService} from '../../../service/carrito.service';
import {AuthService} from '../../../service/auth.service';
import {ValoracionService} from '../../../service/valoracion.service';
import {FormsModule} from '@angular/forms';
import {ValoracionModel} from '../../../models/valoracion.model';

@Component({
  selector: 'app-prod-pred-detalle',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink, FormsModule],
  templateUrl: './prod.pred.detalle.html',
  styleUrl: './prod.pred.detalle.css'
})
export class DetalleProductoPredis implements OnInit {

  private route = inject(ActivatedRoute);
  private prodService = inject(ProdPredService);
  private carritoService = inject(CarritoService);
  private valoracionService = inject(ValoracionService);
  public authService = inject(AuthService);

  producto = signal<any>(null);
  valoraciones = signal<ValoracionModel[]>([]);
  cargando = signal<boolean>(false);

  nuevaValoracion: ValoracionModel = {
    puntuacion: 5,
    comentario: ''
  };


  agregarAlCarrito(p: any) {
    if (!p) return; // Seguridad por si el producto aún no ha cargado

    const productoNormalizado = {
      id: p.id,
      nombre: p.nombreProducto,
      precio: p.precio,
      imagenUrl: p.imagenUrl,
      cantidad: 1
    };

    this.carritoService.agregarProducto(productoNormalizado);
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const pId = +id;
      this.prodService.obtenerPorId(pId).subscribe({
        next: (p) => {
          this.producto.set(p);
          this.cargarListaValoraciones(pId);
        }
      });
    }
  }

  cargarListaValoraciones(id: number) {
    this.valoracionService.obtenerPorProducto(id).subscribe({
      next: (res) => this.valoraciones.set(res)
    });
  }

  enviarValoracion(productoId: number) {
    const user = this.authService.currentUser();

    // aseguramos que existe el usuario y sus roles
    const isAdmin = user && user.roles && user.roles.includes('ADMIN');

    if (!user || isAdmin) {
      console.warn('Acción no permitida');
      return;
    }

    const valoracion: any = {
      puntuacion: Number(this.nuevaValoracion.puntuacion),
      comentario: this.nuevaValoracion.comentario,
      producto: { id: productoId }
      // No hace falta enviar 'usuario' ni 'fechaValoracion', el back los pone
    };

    this.valoracionService.guardarValoracion(valoracion).subscribe({
      next: () => {
        this.nuevaValoracion = { puntuacion: 5, comentario: '' };
        this.cargarListaValoraciones(productoId);
      },
      error: (err) => console.error('Error al guardar:', err)
    });
  }

  eliminarComentario(id: number) {
    if (confirm('¿Estás seguro de que quieres borrar este comentario?')) {
      this.valoracionService.delete(id).subscribe({
        next: () => {
          // Esto actualiza la lista visualmente sin recargar la página
          this.valoraciones.update(lista => lista.filter(v => v.id !== id));
        },
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }

}
