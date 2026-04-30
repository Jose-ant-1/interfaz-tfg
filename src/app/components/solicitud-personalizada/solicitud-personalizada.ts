import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AdminConfigService } from '../../service/configuracion.service';
import { SolicitudPersoService } from '../../service/solicitud-perso.service';
import { AuthService } from '../../service/auth.service';
import { FormsModule } from '@angular/forms';
import { SolicitudPersonalizada } from '../../models/solicitud-personalizada.model';
import { Material, Tecnologia } from '../../models/configuracion.model';
import { ArchivoService } from '../../service/archivo-solicitud.service';

@Component({
  selector: 'app-pedido-personalizado',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './solicitud-personalizada.html',
})
export class PedidoPersonalizadoComponent implements OnInit {
  private configService = inject(AdminConfigService);
  private solicitudService = inject(SolicitudPersoService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private archivoService = inject(ArchivoService);

  materiales = signal<Material[]>([]);
  tecnologias = signal<Tecnologia[]>([]);
  cargando = signal(false);

  // 1. VARIABLE ÚNICA PARA EL ARCHIVO
  archivoSeleccionado: File | null = null;

  solicitud: SolicitudPersonalizada = {
    tipoServicio: 'IMPRESION_3D',
    material: undefined,
    tecnologia: undefined,
    descripcion: '',
    requisitosEspeciales: '',
    acabado: '',
    estado: 'EVALUANDO',
  };

  ngOnInit() {
    this.configService.getMateriales().subscribe((data) => this.materiales.set(data));
    this.configService.getTecnologias().subscribe((data) => this.tecnologias.set(data));
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
    }
  }

  // 2. FUNCIÓN PARA PREPARAR LOS DATOS (Evita errores de TS2339)
  private prepararData(): SolicitudPersonalizada {
    const user = this.authService.currentUser();
    return {
      ...this.solicitud,
      usuario: { id: user?.id } as any,
      numeroSolicitud: 'SOL-' + Date.now(),
    };
  }

  // 3. MÉTODO DE ENVÍO ÚNICO Y UNIFICADO
  enviarSolicitud() {
    if (!this.authService.currentUser()) return;

    this.cargando.set(true);

    // Primero creamos la solicitud principal
    this.solicitudService.create(this.prepararData()).subscribe({
      next: (solicitudGuardada) => {
        // Si hay archivo y es para impresión, lo vinculamos[cite: 16, 25]
        if (this.solicitud.tipoServicio === 'IMPRESION_3D' && this.archivoSeleccionado) {
          this.vincularArchivo(solicitudGuardada.id!);
        } else {
          this.router.navigate(['/mis-pedidos']);
        }
      },
      error: () => this.cargando.set(false),
    });
  }

  private vincularArchivo(solicitudId: number) {
    const archivoData: any = {
      // Usamos any temporalmente para evitar el error de asignación TS2345
      nombreArchivo: this.archivoSeleccionado!.name,
      tipoArchivo: this.archivoSeleccionado!.type,
      tamanio: this.archivoSeleccionado!.size / 1024,
      url: 'uploads/' + this.archivoSeleccionado!.name,
      fechaSubida: new Date().toISOString().split('T')[0],
      solicitud: { id: solicitudId }, // Ajustado para que coincida con @JoinColumn(name = "id_solicitud")
    };

    this.archivoService.guardarReferenciaArchivo(archivoData).subscribe({
      next: () => this.router.navigate(['/mis-pedidos']),
      error: (err) => {
        console.error('Error al vincular archivo:', err);
        this.cargando.set(false);
      },
    });
  }
}
