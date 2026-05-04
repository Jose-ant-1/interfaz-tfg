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
      return s === 'PENDIENTE' || s === 'ENPROCESO' || s === 'RECLAMADO' || s === 'EVALUANDO' || s === 'PRESUPUESTADO';
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
        // Intentamos sacar el código SOL-XXXX de la nota si p.solicitud no existe
        if (!pedidoCompleto.solicitud && pedidoCompleto.notaCliente?.includes('SOL-')) {
          const codigoSolicitud = pedidoCompleto.notaCliente.split(': ')[1]; // Extrae "SOL-1777..."

          // Ahora buscamos todas las solicitudes y filtramos por ese código
          this.solicitudService.findAll().subscribe(solicitudes => {
            const solicitudReal = solicitudes.find(s => s.numeroSolicitud === codigoSolicitud);

            if (solicitudReal) {
              // Inyectamos la solicitud encontrada en el pedido local
              this.pedidoService.pedidos.update(lista =>
                lista.map(p => p.idPedido === id ? { ...p, solicitud: solicitudReal } : p)
              );
            }
          });
        }
      }
    });
  }

  private cargarArchivoDeSolicitud(solicitudId: number) {
    this.archivoService.obtenerArchivos().subscribe((archivos: ArchivoSolicitud[]) => {
      const archivo = archivos.find(a => a.id_solicitud === solicitudId);
      this.archivoExpandido.set(archivo);
    });
  }

  private cargarDatosAdicionales(pedidoId: number) {
    // 1. Obtenemos el pedido completo desde el servidor para traer la relación 'solicitud'
    this.pedidoService.getPedidoById(pedidoId).subscribe(pedidoCompleto => {

      // Buscamos el pedido en el signal local y le inyectamos la solicitud cargada
      this.pedidoService.pedidos.update(lista =>
        lista.map(p => p.idPedido === pedidoId ? { ...p, solicitud: pedidoCompleto.solicitud } : p)
      );

      // 2. Si tiene solicitud, cargamos su archivo asociado
      if (pedidoCompleto.solicitud?.id) {
        this.archivoService.obtenerArchivos().subscribe((archivos: ArchivoSolicitud[]) => {
          // Buscamos el archivo que pertenezca a esta solicitud
          const archivo = archivos.find(a => a.id_solicitud === pedidoCompleto.solicitud?.id);
          this.archivoExpandido.set(archivo);
        });
      }
    });
  }

  descargarArchivo(archivo: any) {
    if (!archivo) return;
    // Lógica simple de descarga: asumiendo que la URL es accesible
    window.open(`http://localhost:8080/api/archivos/download/${archivo.id}`, '_blank');
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
    const precio = prompt(`Introduce el precio total para la solicitud personalizada del cliente ${pedido.usuario.nombre}:`);

    if (precio && !isNaN(Number(precio))) {
      const body = {
        estado: 'PRESUPUESTADO',
        total: Number(precio)
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
        }
      });
    }
  }

}
