import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PasoProceso {
  id: string;
  titulo: string;
  descripcion: string;
}

@Component({
  selector: 'app-quienes-somos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quienes-somos.html',
})
export class QuienesSomosComponent {
  // Procesos que definen el servicio de la tienda
  procesos = signal<PasoProceso[]>([
    {
      id: '01',
      titulo: 'Diseño & Análisis',
      descripcion:
        'Recibimos tus ideas o archivos y optimizamos cada parámetro para asegurar una impresión exitosa.',
    },
    {
      id: '02',
      titulo: 'Producción de Alta Precisión',
      descripcion:
        'Utilizamos tecnología FDM y Resina de última generación para capturar cada detalle de tu proyecto.',
    },
    {
      id: '03',
      titulo: 'Control de Calidad',
      descripcion:
        'Cada pieza es inspeccionada manualmente y post-procesada para un acabado profesional antes del envío.',
    },
  ]);
}
