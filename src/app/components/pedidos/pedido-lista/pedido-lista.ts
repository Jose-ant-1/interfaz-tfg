import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { PedidoService } from '../../../service/pedido.service';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { SolicitudPersoService } from '../../../service/solicitud-perso.service';
import { ArchivoService } from '../../../service/archivo-solicitud.service';
import {ArchivoSolicitud} from '../../../models/archivo-solicitud';

@Component({
  selector: 'app-pedidos-lista',
  standalone: true,
  imports: [CurrencyPipe, CommonModule],
  templateUrl: './pedido-lista.html',
})
export class PedidosListaComponent implements OnInit {
  public pedidoService = inject(PedidoService);
  private solicitudService = inject(SolicitudPersoService);
  private archivoService = inject(ArchivoService);

  idPedidoExpandido = signal<number | null>(null);

  archivoExpandido = signal<any>(null);

  // Helper para normalizar strings de estado y evitar errores de comparación
  private normalizarEstado(estado: string): string {
    return estado?.toUpperCase().replace(/[\s_]/g, '') || '';
  }

  pedidosPendientes = computed(() =>
    this.pedidoService.pedidos().filter((p) => {
      const s = this.normalizarEstado(p.estado);
      // Añadimos EVALUANDO y PRESUPUESTADO a la lista de gestión activa
      return (
        s === 'PENDIENTE' ||
        s === 'ENPROCESO' ||
        s === 'RECLAMADO' ||
        s === 'EVALUANDO' ||
        s === 'PRESUPUESTADO'
      );
    }),
  );

  pedidosCompletados = computed(() =>
    this.pedidoService.pedidos().filter((p) => {
      const s = this.normalizarEstado(p.estado);
      return s === 'ENVIADO' || s === 'COMPLETADO' || s === 'CANCELADO';
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
        // 1. Forzamos la actualización de TODO el objeto pedido en la lista
        this.pedidoService.pedidos.update((lista) =>
          lista.map((p) => (p.idPedido === id ? { ...p, ...pedidoCompleto } : p)),
        );

        // 2. Lógica para capturar la solicitud (vía relación o nota)
        if (pedidoCompleto.solicitud?.id) {
          this.cargarArchivoDeSolicitud(pedidoCompleto.solicitud.id);
        } else if (pedidoCompleto.notaCliente?.includes('SOL-')) {
          const codigoSolicitud = pedidoCompleto.notaCliente.split(': ')[1];
          this.solicitudService.findAll().subscribe((solicitudes) => {
            const solicitudReal = solicitudes.find((s) => s.numeroSolicitud === codigoSolicitud);
            if (solicitudReal) {
              this.pedidoService.pedidos.update((lista) =>
                lista.map((p) => (p.idPedido === id ? { ...p, solicitud: solicitudReal } : p)),
              );
              this.cargarArchivoDeSolicitud(solicitudReal.id!);
            }
          });
        }
      },
    });
  }

  private cargarArchivoDeSolicitud(solicitudId: number) {
    // 1. Limpiamos el archivo anterior para que no haya confusiones
    this.archivoExpandido.set(null);

    this.archivoService.obtenerArchivos().subscribe((archivos: ArchivoSolicitud[]) => {
      // 2. IMPORTANTE: Verifica si tu modelo usa 'id_solicitud' o 'solicitud.id'
      // Probamos con ambas por seguridad:
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

    const url = `http://localhost:8080/api/archivos/download/${archivo.id}`;

    this.archivoService.descargarArchivoSeguro(url).subscribe({
      next: (blob: Blob) => {
        // Creamos una URL temporal para el binario (Blob) recibido
        const urlBlob = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = urlBlob;
        anchor.download = archivo.nombreArchivo; // Forzamos el nombre original
        anchor.click();

        // Limpiamos la memoria
        window.URL.revokeObjectURL(urlBlob);
      },
      error: (err) => {
        console.error('Error en la descarga:', err);
        alert('No tienes permiso para descargar este archivo o no existe.');
      },
    });
  }

  cambiarEstado(id: number, estado: string) {
    this.pedidoService.actualizarEstado(id, estado).subscribe({
      next: () => this.pedidoService.obtenerTodos(),
      error: (err) => console.error('Error al actualizar estado', err),
    });
  }

  // Nueva función para usar en el HTML y que los botones no fallen por un "_"
  esEstado(pedidoEstado: string, estadoObjetivo: string): boolean {
    return this.normalizarEstado(pedidoEstado) === this.normalizarEstado(estadoObjetivo);
  }

  presupuestarPedido(pedido: any) {
    const precio = prompt(
      `Introduce el precio total para la solicitud personalizada del cliente ${pedido.usuario.nombre}:`,
    );

    if (precio && !isNaN(Number(precio))) {
      const body = {
        estado: 'PRESUPUESTADO',
        total: Number(precio),
      };

      // CAMBIO CRUCIAL: Usar el método que acepta el objeto completo
      this.pedidoService.actualizarEstadoConPrecio(pedido.idPedido, body).subscribe({
        next: () => {
          alert('Presupuesto enviado al cliente con éxito.');
          this.pedidoService.obtenerTodos();
        },
        error: (err) => {
          console.error('Error al guardar presupuesto:', err);
          alert('No se pudo guardar el presupuesto.');
        },
      });
    }
  }
}
