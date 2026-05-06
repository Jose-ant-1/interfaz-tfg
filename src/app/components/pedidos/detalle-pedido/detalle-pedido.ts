import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PedidoService } from '../../../service/pedido.service';
import { ArchivoService } from '../../../service/archivo-solicitud.service'; //
import { Pedido } from '../../../models/pedido.model';
import { ArchivoSolicitud } from '../../../models/archivo-solicitud'; //[cite: 19]
import { CommonModule } from '@angular/common';
import { SolicitudPersoService } from '../../../service/solicitud-perso.service';

@Component({
  selector: 'app-detalle-pedido',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalle-pedido.html',
})
export class DetallePedidoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private pedidoService = inject(PedidoService);
  private archivoService = inject(ArchivoService); //[cite: 18]
  private solicitudService = inject(SolicitudPersoService);

  pedido = signal<Pedido | null>(null);
  archivoSubido = signal<ArchivoSolicitud | null>(null); // Signal para el archivo[cite: 19]
  error = signal<string | null>(null);

// En detalle-pedido.ts

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.pedidoService.getPedidoById(id).subscribe({
        next: (data: any) => {
          this.pedido.set(data);

          // --- LÓGICA CORREGIDA PARA ENCONTRAR EL ARCHIVO ---

          // 1. Si el objeto ya trae la solicitud (relación directa)
          if (data.solicitud?.id) {
            this.cargarArchivo(data.solicitud.id);
          }
          // 2. Si no, extraemos el SOL- del número de pedido (ej: "PED-SOL-12345")
          else if (data.numeroPedido?.includes('SOL-')) {
            const match = data.numeroPedido.match(/SOL-\d+/);
            if (match) {
              const numeroSolicitud = match[0];
              this.buscarSolicitudPorNumero(numeroSolicitud);
            }
          }
        },
        error: (err) => {
          this.error.set("No se pudo cargar el detalle del pedido.");
          console.error(err);
        }
      });
    }
  }

  private buscarSolicitudPorNumero(numero: string) {
    this.solicitudService.findAll().subscribe((solicitudes) => {
      const encontrada = solicitudes.find((s) => s.numeroSolicitud === numero);
      if (encontrada) {
        // "Inyectamos" la solicitud en el objeto pedido localmente
        const p = this.pedido();
        if (p) {
          p.solicitud = encontrada; // Solo vive en la memoria del navegador
          this.pedido.set({ ...p });
          if (encontrada.id) this.cargarArchivo(encontrada.id);
        }
      }
    });
  }

  private cargarArchivo(solicitudId: number) {
    this.archivoService.obtenerArchivos().subscribe({
      next: (archivos) => {
        // Buscamos el archivo comprobando múltiples posibles nombres de campo
        const archivo = archivos.find((a: any) =>
          a.id_solicitud === solicitudId ||
          a.solicitudId === solicitudId ||
          (a.solicitud && a.solicitud.id === solicitudId)
        );

        if (archivo) {
          this.archivoSubido.set(archivo);
        } else {
          console.warn("No se encontró ningún archivo para la solicitud:", solicitudId);
        }
      },
      error: (err) => console.error("Error al obtener archivos:", err)
    });
  }

  descargar() {
    const archivo = this.archivoSubido();
    if (archivo?.id) {
      const url = `http://localhost:8080/api/archivos/download/${archivo.id}`;
      this.archivoService.descargarArchivoSeguro(url).subscribe({
        next: (blob: Blob) => {
          const urlBlob = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = urlBlob;
          a.download = archivo.nombreArchivo;
          a.click();
          window.URL.revokeObjectURL(urlBlob);
        },
      });
    }
  }
}
