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

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.pedidoService.getPedidoById(id).subscribe({
        // En detalle-pedido.ts dentro del subscribe de getPedidoById

        next: (data) => {
          this.pedido.set(data);

          // Extraemos el código SOL del número de pedido (ej: "PED-SOL-177...")
          const numPedido = data.numeroPedido || '';
          const matchSolicitud = numPedido.match(/SOL-\d+/);

          if (matchSolicitud) {
            const codigoABuscar = matchSolicitud[0];

            this.solicitudService.findAll().subscribe((solicitudes) => {
              // Búsqueda precisa por CÓDIGO DE SOLICITUD, no por usuario
              const encontrada = solicitudes.find((s) => s.numeroSolicitud === codigoABuscar);

              if (encontrada) {
                const p = this.pedido();
                if (p) {
                  p.solicitud = encontrada; // Ahora sí es la ID 17 y no la 2
                  this.pedido.set({ ...p });
                  if (encontrada.id) this.cargarArchivo(encontrada.id);
                }
              }
            });
          }
        },
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
    this.archivoService.obtenerArchivos().subscribe((archivos) => {
      const archivo = archivos.find((a) => a.id_solicitud === solicitudId);
      if (archivo) this.archivoSubido.set(archivo);
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
