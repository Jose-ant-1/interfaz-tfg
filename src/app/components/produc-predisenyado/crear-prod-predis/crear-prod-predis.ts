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

  // Los 16 campos inicializados
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

  ngOnInit() {
    this.configService.getMateriales().subscribe(data => this.materiales.set(data));
    this.configService.getTecnologias().subscribe(data => this.tecnologias.set(data));
  }

  guardarNuevo() {
    const p = { ...this.producto() };

    // Limpieza y conversión de tipos para el Backend
    p.precio = Number(p.precio);
    p.stockDisponible = Number(p.stockDisponible);
    p.pesoGramos = Number(p.pesoGramos);
    p.tiempoImpresionMinutos = Number(p.tiempoImpresionMinutos);

    this.prodService.crear(p).subscribe({
      next: () => this.router.navigate(['/productos']),
      error: (err) => alert("Error al crear: " + err.message)
    });
  }
}
