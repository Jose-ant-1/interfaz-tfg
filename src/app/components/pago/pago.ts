import { Component, inject, signal } from '@angular/core';
import { CarritoService } from '../../service/carrito.service';
import { PagoService } from '../../service/pago.service';
import { PedidoService } from '../../service/pedido.service';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Pago } from '../../models/pago.model';

@Component({
  selector: 'app-pago',
  standalone: true,
  templateUrl: './pago.html',
  imports: [FormsModule, CurrencyPipe],
})
export class PagoComponent {
  private carritoService = inject(CarritoService);
  private pagoService = inject(PagoService);
  private pedidoService = inject(PedidoService);
  private authService = inject(AuthService);
  private router = inject(Router);

  carritoItems = this.carritoService.items; // Asumiendo que usas signals en el carrito
  totalCarrito = this.carritoService.precioTotal;
  cargando = signal(false);

  datosEnvio = { direccion: '', nota: '' };

  async realizarPago() {
    if (!this.datosEnvio.direccion) {
      alert('Por favor, introduce una dirección de envío.');
      return;
    }

    this.cargando.set(true);

    // 1. Aquí llamaríamos a la comprobación de stock que mencionaste
    // (Implementaremos el endpoint en el siguiente paso del Back)

    try {
      // 2. Simulación de éxito de pasarela (Stripe/PayPal)
      const transaccionId = 'TRANS-' + Math.random().toString(36).substr(2, 9).toUpperCase();

      // 3. Crear el objeto PedidoDTO para el Backend
      const pedidoDTO = {
        idUsuario: this.authService.currentUser()?.id,
        total: this.totalCarrito(), // Ahora sí coincide
        direccionEnvio: this.datosEnvio.direccion,
        notaCliente: this.datosEnvio.nota,
        items: this.carritoItems().map((item) => ({
          idProducto: item.productoId, // Asegúrate de que es productoId según tu carrito.service
          cantidad: item.cantidad,
          precioUnitario: item.precio,
        })),
      };

      // 4. Llamar al backend para crear pedido y restar stock
      this.pedidoService.crearPedido(pedidoDTO).subscribe({
        next: (pedidoCreado: any) => {
          // Tipado explícito para evitar TS7006
          const pagoData: Pago = {
            idUsuario: this.authService.currentUser()?.id || 0,
            idPedido: pedidoCreado.id, // Usamos el ID que nos devuelve el backend
            importe: this.totalCarrito(),
            metodoPago: 'TARJETA', // O el valor que elijas
            estadoPago: 'COMPLETADO',
            idTransaccion: transaccionId, // La variable que generaste arriba
            fechaPago: new Date().toISOString(),
          };

          this.pagoService.procesarPagoSimulado(pagoData).subscribe(() => {
            this.carritoService.limpiarCarrito(); // Ahora existirá
            this.router.navigate(['/mis-pedidos']);
            alert('¡Pago realizado con éxito!');
          });
        },
        error: (err: any) => {
          // Tipado explícito para evitar TS7006
          this.cargando.set(false);
          alert('Error: ' + (err.error?.error || 'No se pudo procesar'));
        },
      });
    } catch (error) {
      this.cargando.set(false);
      console.error(error);
    }
  }





}
