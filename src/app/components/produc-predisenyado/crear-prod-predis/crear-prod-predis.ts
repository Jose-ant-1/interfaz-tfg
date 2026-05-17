import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProdPredService } from '../../../service/prod.predis.service';
import { AdminConfigService } from '../../../service/configuracion.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Producto } from '../../../models/prod.predis.model';

@Component({
  selector: 'app-crear-prod-predis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-prod-predis.html'
})
export class CrearProdPredis implements OnInit {
  private router = inject(Router);
  private prodService = inject(ProdPredService);
  private configService = inject(AdminConfigService);

  producto = signal<Producto>({
    nombreProducto: '',
    descripcion: '',
    caracteristicas: '',
    precio: 0,
    stockDisponible: 0,
    dimensiones: '',
    pesoGramos: 0,
    tiempoImpresionMinutos: 0,
    imagenUrl: '',
    destacado: false,
    disponible: true,
    material: null,
    tecnologia: null,
    fechaCreacion: undefined,
    fechaActualizacion: undefined
  });

  materiales = signal<any[]>([]);
  tecnologias = signal<any[]>([]);

  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.configService.getMateriales().subscribe(data => this.materiales.set(data));
    this.configService.getTecnologias().subscribe(data => this.tecnologias.set(data));
  }

  guardarNuevo() {
    this.errorMessage.set(null); // Limpiamos errores previos
    const p = { ...this.producto() };

    // Validaciones básicas antes de enviar
    if (p.precio <= 0) {
      this.errorMessage.set('El precio debe ser mayor a 0');
      return;
    }

    // Conversión de tipos
    p.precio = Number(p.precio);
    p.stockDisponible = Number(p.stockDisponible);
    p.pesoGramos = Number(p.pesoGramos);
    p.tiempoImpresionMinutos = Number(p.tiempoImpresionMinutos);

    this.prodService.crear(p).subscribe({
      next: () => this.router.navigate(['/productos']),
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Error al conectar con el servidor. Revisa que todos los campos obligatorios estén rellenos.');
      }
    });
  }
}
