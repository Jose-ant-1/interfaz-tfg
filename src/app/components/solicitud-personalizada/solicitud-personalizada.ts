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
  private prepararData(): any {
    const user = this.authService.currentUser();

    // Creamos una copia limpia del objeto
    const data: any = {
      tipoServicio: this.solicitud.tipoServicio,
      descripcion: this.solicitud.descripcion,
      requisitosEspeciales: this.solicitud.requisitosEspeciales,
      acabado: this.solicitud.acabado,
      estado: 'EVALUANDO',
      usuario: { id: user?.id },
      numeroSolicitud: 'SOL-' + Date.now(),
      // Eliminamos fechaSolicitud de aquí; deja que el @PrePersist de Java la ponga
    };

    // Solo incluimos material o tecnología si realmente se han seleccionado
    if (this.solicitud.material?.id) {
      data.material = { id: this.solicitud.material.id };
    }
    if (this.solicitud.tecnologia?.id) {
      data.tecnologia = { id: this.solicitud.tecnologia.id };
    }

    return data;
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
    if (!this.archivoSeleccionado) return;

    this.archivoService.subirArchivoReal(this.archivoSeleccionado, solicitudId).subscribe({
      next: () => {
        this.cargando.set(false);
        alert('¡Archivo STL subido correctamente!');
        this.router.navigate(['/mis-pedidos']);
      },
      error: (err) => {
        console.error('Error al subir el archivo físico:', err);
        this.cargando.set(false);
        alert('Error: La solicitud se creó pero el archivo no se pudo subir.');
      },
    });
  }
}
