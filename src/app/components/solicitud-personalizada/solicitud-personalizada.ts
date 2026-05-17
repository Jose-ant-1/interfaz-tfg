import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AdminConfigService } from '../../service/configuracion.service';
import { SolicitudPersoService } from '../../service/solicitud-perso.service';
import { AuthService } from '../../service/auth.service';
import { FormsModule } from '@angular/forms';
import { SolicitudPersonalizada } from '../../models/solicitud-personalizada.model';
import { Material, Tecnologia } from '../../models/configuracion.model';
import { ArchivoService } from '../../service/archivo-solicitud.service';
import {NgClass} from '@angular/common';


@Component({
  selector: 'app-pedido-personalizado',
  standalone: true,
  imports: [FormsModule, NgClass],
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

  mensajeFeedback = signal<{ texto: string; tipo: 'success' | 'error' } | null>(null);

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

  enviarSolicitud() {
    if (!this.authService.currentUser()) return;

    this.cargando.set(true);
    this.mensajeFeedback.set(null); // Limpiar avisos previos

    this.solicitudService.create(this.prepararData()).subscribe({
      next: (solicitudGuardada) => {
        if (this.solicitud.tipoServicio === 'IMPRESION_3D' && this.archivoSeleccionado) {
          this.vincularArchivo(solicitudGuardada.id!);
        } else {
          this.mostrarExitoYRedirigir('Solicitud enviada correctamente');
        }
      },
      error: () => {
        this.cargando.set(false);
        this.mensajeFeedback.set({ texto: 'Error al enviar la solicitud. Inténtalo de nuevo.', tipo: 'error' });
      },
    });
  }

  private vincularArchivo(solicitudId: number) {
    if (!this.archivoSeleccionado) return;

    this.archivoService.subirArchivoReal(this.archivoSeleccionado, solicitudId).subscribe({
      next: () => {
        this.mostrarExitoYRedirigir('Solicitud y archivo subidos con éxito');
      },
      error: (err) => {
        console.error('Error al subir el archivo:', err);
        this.cargando.set(false);
        this.mensajeFeedback.set({
          texto: 'La solicitud se creó, pero hubo un problema con el archivo técnico.',
          tipo: 'error'
        });
      },
    });
  }

  private mostrarExitoYRedirigir(mensaje: string) {
    this.cargando.set(false);
    this.mensajeFeedback.set({ texto: mensaje, tipo: 'success' });
    setTimeout(() => this.router.navigate(['/mis-pedidos']), 2000);
  }
}
