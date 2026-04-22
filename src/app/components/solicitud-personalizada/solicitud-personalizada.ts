import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AdminConfigService } from '../../service/configuracion.service';
import { PedidoService } from '../../service/pedido.service'; // Asumiendo que tienes este service

@Component({
  selector: 'app-pedido-personalizado',
  templateUrl: './solicitud-personalizada.html'
})
export class PedidoPersonalizadoComponent implements OnInit {
  private configService = inject(AdminConfigService);
  private pedidoService = inject(PedidoService);
  private router = inject(Router);

  materiales = signal<any[]>([]);
  cargando = signal(false);

  solicitud = {
    nombre: '',
    material: null,
    detalles: '',
    estado: 'EVALUANDO' // El estado inicial que definimos
  };

  ngOnInit() {
    // Cargamos materiales para que el usuario pueda elegir
    this.configService.getMateriales().subscribe(data => this.materiales.set(data));
  }

  enviarSolicitud() {
    this.cargando.set(true);

    // Aquí llamarías a tu backend para guardar el pedido
    this.pedidoService.crearPedidoPersonalizado(this.solicitud).subscribe({
      next: () => {
        // ÉXITO: Redirigimos directamente a Mis Pedidos
        this.router.navigate(['/mis-pedidos']);
      },
      error: (err: string) => {
        this.cargando.set(false);
        alert('Error al enviar la solicitud. Inténtalo de nuevo.' + err);
      }
    });
  }
}
