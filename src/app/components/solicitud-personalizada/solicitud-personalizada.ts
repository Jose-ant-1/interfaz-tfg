import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AdminConfigService } from '../../service/configuracion.service';
import { SolicitudPersoService } from '../../service/solicitud-perso.service'; // <--- CAMBIAR ESTO
import { AuthService } from '../../service/auth.service'; // <--- NECESARIO PARA EL USUARIO
import { FormsModule } from '@angular/forms';
import { SolicitudPersonalizada } from '../../models/solicitud-personalizada.model';
import { Material, Tecnologia } from '../../models/configuracion.model';

@Component({
  selector: 'app-pedido-personalizado',
  standalone: true, // Asegúrate de que sea standalone si tus otros componentes lo son
  imports: [FormsModule],
  templateUrl: './solicitud-personalizada.html',
})
export class PedidoPersonalizadoComponent implements OnInit {
  private configService = inject(AdminConfigService);
  private solicitudService = inject(SolicitudPersoService); // <--- USAR EL NUEVO SERVICIO
  private authService = inject(AuthService); // <--- INYECTAR AUTH
  private router = inject(Router);

  materiales = signal<Material[]>([]);
  tecnologias = signal<Tecnologia[]>([]); // Añadido por si quieres que elijan tecnología
  cargando = signal(false);

  // Ajustamos el objeto inicial al modelo de Java
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

  enviarSolicitud() {
    const user = this.authService.currentUser();
    if (!user) return;

    this.cargando.set(true);

    const dataAEnviar: SolicitudPersonalizada = {
      ...this.solicitud,
      usuario: { id: user.id } as any,
      numeroSolicitud: 'SOL-' + Date.now()
    };

    this.solicitudService.create(dataAEnviar).subscribe({
      next: () => this.router.navigate(['/mis-pedidos']),
      error: () => this.cargando.set(false)
    });
  }
}
