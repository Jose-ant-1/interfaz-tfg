import {Component, inject, OnInit, signal} from '@angular/core';
import { CarritoService } from '../../service/carrito.service';
import { PagoService } from '../../service/pago.service';
import { PedidoService } from '../../service/pedido.service';
import {ActivatedRoute, Router} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import {UsuarioService} from '../../service/usuario.service';
import {AuthService} from '../../service/auth.service';
import {Pago} from '../../models/pago.model';

@Component({
  selector: 'app-pago',
  standalone: true,
  templateUrl: './pago.html',
  imports: [FormsModule, CurrencyPipe],
})
export class PagoComponent implements OnInit {
  private route = inject(ActivatedRoute);

  private carritoService = inject(CarritoService);
  private pagoService = inject(PagoService);
  private pedidoService = inject(PedidoService);
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService); // Necesitas el servicio donde guardes el email al hacer login
  private router = inject(Router);

  esPedidoPersonalizado = signal(false);
  pedidoIdRecuperado = signal<number | null>(null);
  totalAMostrar = signal(0);
  itemsAMostrar = signal<any[]>([]);

  // Datos de tarjeta
  numeroTarjeta = signal('');
  fechaExpiracion = signal(''); // Formato MM/YY
  cvc = signal('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      // ESCENARIO A: Pedido Personalizado
      this.esPedidoPersonalizado.set(true);
      this.pedidoIdRecuperado.set(+id);
      this.cargarPedidoPersonalizado(+id);
    } else {
      // ESCENARIO B: Flujo normal de Carrito[cite: 30]
      this.totalAMostrar.set(this.carritoService.precioTotal());
      this.itemsAMostrar.set(this.carritoItems());
    }

    // Recuperamos el email que ya gestiona tu AuthService
    const email = this.authService.getEmail();

    if (email) {
      // Usamos el método obtenerPorEmail que ya tienes definido
      this.usuarioService.obtenerPorEmail(email).subscribe({
        next: (user) => {
          if (user) {
            // Mapeamos los campos del modelo Usuario
            this.datosEnvio.direccion = user.direccion || '';
            this.datosEnvio.ciudad = user.ciudad || '';
            this.datosEnvio.codigoPostal = user.codigoPostal ? user.codigoPostal.toString() : '';
          }
        },
        error: (err) => console.error('Error al precargar datos:', err)
      });
    }
  }

  cargarPedidoPersonalizado(id: number) {
    this.pedidoService.getPedidoById(id).subscribe({
      next: (pedido: any) => {
        this.totalAMostrar.set(pedido.total);
        // Creamos un item ficticio para la vista de resumen
        this.itemsAMostrar.set([{
          nombre: 'Solicitud Personalizada',
          cantidad: 1,
          precio: pedido.total
        }]);
      }
    });
  }

  // Formatear número de tarjeta: Bloques de 4
  onNumeroTarjetaInput(event: any) {
    let val = event.target.value.replace(/\D/g, ''); // Solo números
    if (val.length > 16) val = val.substring(0, 16);

    // Agrupar de 4 en 4
    const blocks = val.match(/.{1,4}/g);
    this.numeroTarjeta.set(blocks ? blocks.join(' ') : val);
  }

  // Formatear Fecha MM/YY
  onFechaInput(event: any) {
    let val = event.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.substring(0, 4);

    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2);
    }
    this.fechaExpiracion.set(val);
  }

  // Validar si la fecha es futura
  isFechaValida(): boolean {
    const fecha = this.fechaExpiracion();
    if (!fecha || !fecha.includes('/')) return false;

    const [month, yearStr] = fecha.split('/').map(Number);
    if (!month || !yearStr || month > 12 || month < 1) return false;

    const now = new Date();
    const currentMonth = now.getMonth() + 1; // getMonth() va de 0 a 11
    // Obtenemos los últimos 2 dígitos del año actual (ej: 2024 -> 24)
    const currentYear = parseInt(now.getFullYear().toString().slice(-2));

    // Si el año es menor al actual, no es válida
    if (yearStr < currentYear) return false;

    // Si es el mismo año pero el mes ya pasó o es el actual (dependiendo de tu política,
    // normalmente las tarjetas valen hasta el último día del mes impreso)
    return !(yearStr === currentYear && month < currentMonth);

  }

  carritoItems = this.carritoService.items;
  totalCarrito = this.carritoService.precioTotal;
  cargando = signal(false);

  // Señales para controlar el stock
  datosEnvio = {
    direccion: '',
    ciudad: '',
    codigoPostal: '',
    nota: ''
  };

  async realizarPago() {
    // 1. Validaciones Comunes (Dirección y Tarjeta) - Se mantienen intactas
    if (!this.datosEnvio.direccion || !this.datosEnvio.ciudad || !this.datosEnvio.codigoPostal) {
      alert('Por favor, rellena todos los datos de envío (Dirección, Ciudad y CP).');
      return;
    }

    const numLimpio = this.numeroTarjeta().replace(/\s/g, '');
    if (numLimpio.length !== 16) {
      alert('El número de tarjeta debe tener 16 dígitos.');
      return;
    }

    if (!this.isFechaValida()) {
      alert('La tarjeta está caducada o la fecha no es válida (Formato: MM/YY).');
      return;
    }

    if (this.cvc().length < 3) {
      alert('El código CVC debe tener 3 dígitos.');
      return;
    }

    this.cargando.set(true);

    // 2. Preparación de datos comunes para el Pago
    const numTarjetaStr = this.numeroTarjeta().replace(/\s/g, '');
    const ultimos4 = numTarjetaStr.slice(-4);

    // --- BIFURCACIÓN DE LÓGICA ---

    if (this.esPedidoPersonalizado() && this.pedidoIdRecuperado()) {
      const idPedido = this.pedidoIdRecuperado()!;
      const importe = this.totalAMostrar();
      const numTarjetaStr = this.numeroTarjeta().replace(/\s/g, '');
      const ultimos4 = numTarjetaStr.slice(-4);

      // 1. Preparamos el objeto de pago con todos los detalles
      const pagoData: Pago = {
        pedido: { idPedido: idPedido },
        importe: importe,
        metodoPago: 'TARJETA',
        estadoPago: 'COMPLETADO',
        idTransaccion: `TRANS-${Math.random().toString(36).toUpperCase()}`,
        detalles: `Visa/MC Personalizado **** ${ultimos4}`
      };

      // 2. Procesamos el pago simulado[cite: 34]
      this.pagoService.procesarPagoSimulado(pagoData).subscribe({
        next: () => {
          // 3. CAMBIO CLAVE: Usamos confirmarPagoPedido para evitar el 403[cite: 28, 29]
          // Este método internamente en el backend pasará el pedido de 'PRESUPUESTADO' a 'PENDIENTE'
          this.pedidoService.confirmarPagoPedido(idPedido).subscribe({
            next: () => {
              // No necesitamos limpiar carrito aquí porque es personalizado[cite: 34]
              alert('Pago realizado con éxito. Tu pedido ya está en cola de preparación.');
              this.router.navigate(['/mis-pedidos']);
            },
            error: (err) => {
              this.cargando.set(false); // Liberamos el botón si falla[cite: 34]
              console.error('Error al activar el pedido tras pago:', err);
              alert('El pago se procesó, pero hubo un error al actualizar el pedido. Contacta con soporte.');
            }
          });
        },
        error: (err) => {
          this.cargando.set(false); // Importante: restaurar estado si el pago falla[cite: 34]
          console.error('Error en la pasarela de pago:', err);
          alert('La transacción ha sido rechazada. Revisa los datos de tu tarjeta.');
        }
      });
    } else {
      // ESCENARIO B: Flujo Original (Carrito -> Crear Pedido -> Pago)[cite: 22]
      const totalLimpio = Number(this.totalCarrito().toFixed(2));

      const pedidoDTO = {
        total: totalLimpio,
        direccionEnvio: this.datosEnvio.direccion,
        ciudadEnvio: this.datosEnvio.ciudad,
        codigoPostalEnvio: this.datosEnvio.codigoPostal,
        notaCliente: this.datosEnvio.nota,
        items: this.carritoItems().map((item) => ({
          idProducto: item.productoId || item.id,
          cantidad: item.cantidad,
          precioUnitario: item.precio,
        })),
      };

      this.pedidoService.crearPedido(pedidoDTO).subscribe({
        next: (pedidoCreado: any) => {
          const pagoData: Pago = {
            pedido: { idPedido: pedidoCreado.idPedido },
            importe: totalLimpio,
            metodoPago: 'TARJETA',
            estadoPago: 'COMPLETADO',
            idTransaccion: `TRANS-${Math.random().toString(36).toUpperCase()}`,
            detalles: `Visa/MC **** ${ultimos4}`
          };

          this.pagoService.procesarPagoSimulado(pagoData).subscribe({
            next: () => {
              this.carritoService.limpiarCarrito();
              this.router.navigate(['/mis-pedidos']);
            },
            error: (err) => {
              this.cargando.set(false);
              console.error('Error en el pago del carrito:', err);
            },
          });
        },
        error: (err) => {
          this.cargando.set(false);
          console.error('Error al crear pedido desde carrito:', err);
        }
      });
    }
  }

}
