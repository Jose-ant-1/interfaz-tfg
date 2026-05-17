import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { PedidoService } from '../../../service/pedido.service';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { SolicitudPersoService } from '../../../service/solicitud-perso.service';
import { ArchivoService } from '../../../service/archivo-solicitud.service';
import {ArchivoSolicitud} from '../../../models/archivo-solicitud';
import {environment} from '../../../environments/environment';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-pedidos-lista',
  standalone: true,
  imports: [CurrencyPipe, CommonModule, FormsModule],
  templateUrl: './pedido-lista.html',
})
export class PedidosListaComponent implements OnInit {
  public pedidoService = inject(PedidoService);
  private solicitudService = inject(SolicitudPersoService);
  private archivoService = inject(ArchivoService);

  mensajeFeedback = signal<{ texto: string; tipo: 'success' | 'error' } | null>(null);
  pedidoEnPresupuesto = signal<number | null>(null);
  precioPresupuesto = signal<number | null>(null);

  idPedidoExpandido = signal<number | null>(null);

  archivoExpandido = signal<any>(null);

  // Helper para normalizar strings de estado y evitar errores de comparación
  private normalizarEstado(estado: string): string {
    return estado?.toUpperCase().replace(/[\s_]/g, '') || '';
  }

  pedidosPendientes = computed(() =>
    this.pedidoService.pedidos().filter((p) => {
      const s = this.normalizarEstado(p.estado);
      return (
        s === 'PENDIENTE' ||
        s === 'ENPROCESO' ||
        s === 'RECLAMADO' ||
        s === 'EVALUANDO' ||
        s === 'PRESUPUESTADO' ||
        s === "ENVIADO"
      );
    }),
  );

  pedidosCompletados = computed(() =>
    this.pedidoService.pedidos().filter((p) => {
      const s = this.normalizarEstado(p.estado);
      return s === 'COMPLETADO' || s === 'CANCELADO';
    }),
  );

  ngOnInit() {
    this.pedidoService.obtenerTodos();
  }

  toggleDetalles(id: number) {
    if (this.idPedidoExpandido() === id) {
      this.idPedidoExpandido.set(null);
      return;
    }

    this.idPedidoExpandido.set(id);

    this.pedidoService.getPedidoById(id).subscribe({
      next: (pedidoCompleto: any) => {
        this.pedidoService.pedidos.update((lista) =>
          lista.map((p) => (p.idPedido === id ? { ...p, ...pedidoCompleto } : p))
        );

        // Si el objeto ya trae la solicitud vinculada
        if (pedidoCompleto.solicitud?.id) {
          this.cargarArchivoDeSolicitud(pedidoCompleto.solicitud.id);
        }
        // Si no, la buscamos por el código SOL en el número de pedido
        else if (pedidoCompleto.numeroPedido?.includes('SOL-')) {
          const match = pedidoCompleto.numeroPedido.match(/SOL-\d+/);
          if (match) {
            const codigoSolicitud = match[0];

            this.solicitudService.findAll().subscribe((solicitudes) => {
              const solicitudReal = solicitudes.find((s) => s.numeroSolicitud === codigoSolicitud);
              if (solicitudReal) {
                // Actualizamos de nuevo la lista para inyectar la solicitud encontrada
                this.pedidoService.pedidos.update((lista) =>
                  lista.map((p) => (p.idPedido === id ? { ...p, solicitud: solicitudReal } : p))
                );
                if (solicitudReal.id) this.cargarArchivoDeSolicitud(solicitudReal.id);
              }
            });
          }
        }
      },
      error: (err) => console.error('Error al expandir detalles:', err)
    });
  }

  iniciarPresupuesto(id: number, totalActual: number) {
    this.pedidoEnPresupuesto.set(id);
    this.precioPresupuesto.set(totalActual > 0 ? totalActual : null);
  }

  cancelarPresupuesto() {
    this.pedidoEnPresupuesto.set(null);
    this.precioPresupuesto.set(null);
  }

  confirmarPresupuesto(id: number) {
    const precio = this.precioPresupuesto();

    if (!precio || precio <= 0) {
      this.mostrarFeedback('Introduce un precio válido mayor a 0', 'error');
      return;
    }

    const body = {
      estado: 'PRESUPUESTADO',
      total: Number(precio),
    };

    this.pedidoService.actualizarEstadoConPrecio(id, body).subscribe({
      next: () => {
        this.mostrarFeedback('Presupuesto enviado al cliente con éxito', 'success');
        this.pedidoEnPresupuesto.set(null);
        this.pedidoService.obtenerTodos();
      },
      error: (err) => {
        console.error(err);
        this.mostrarFeedback('Error al guardar el presupuesto', 'error');
      }
    });
  }

  mostrarFeedback(texto: string, tipo: 'success' | 'error') {
    this.mensajeFeedback.set({ texto, tipo });
    setTimeout(() => this.mensajeFeedback.set(null), 3000);
  }

  private cargarArchivoDeSolicitud(solicitudId: number) {
    // Limpiamos el archivo anterior para que no haya confusiones
    this.archivoExpandido.set(null);

    this.archivoService.obtenerArchivos().subscribe((archivos: ArchivoSolicitud[]) => {
      const archivo = archivos.find(
        (a: any) =>
          a.id_solicitud === solicitudId || (a.solicitud && a.solicitud.id === solicitudId),
      );

      if (archivo) {
        this.archivoExpandido.set(archivo);
      } else {
        console.warn('No se encontró archivo para la solicitud ID:', solicitudId);
      }
    });
  }

  descargarArchivo(archivo: any) {
    if (!archivo) return;
    const url = `${environment.apiUrl}/archivos/download/${archivo.id}`;

    this.archivoService.descargarArchivoSeguro(url).subscribe({
      next: (blob: Blob) => {
        const urlBlob = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = urlBlob;
        anchor.download = archivo.nombreArchivo;
        anchor.click();
        window.URL.revokeObjectURL(urlBlob);
      },
      error: () => this.mostrarFeedback('No tienes permiso o el archivo no existe', 'error')
    });
  }

  cambiarEstado(id: number, estado: string) {
    this.pedidoService.actualizarEstado(id, estado).subscribe({
      next: () => this.pedidoService.obtenerTodos(),
      error: (err) => console.error('Error al actualizar estado', err),
    });
  }

  esEstado(pedidoEstado: string, estadoObjetivo: string): boolean {
    return this.normalizarEstado(pedidoEstado) === this.normalizarEstado(estadoObjetivo);
  }

}
