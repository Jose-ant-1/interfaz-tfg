import { Component, inject, signal, OnInit } from '@angular/core';
import { CarritoService } from '../../service/carrito.service';
import { PagoService } from '../../service/pago.service';
import { PedidoService } from '../../service/pedido.service';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';

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

  carritoItems = this.carritoService.items;
  totalCarrito = this.carritoService.precioTotal;
  cargando = signal(false);

  // Señales para controlar el stock
  datosEnvio = { direccion: '', nota: '' };



  async realizarPago() {
    // Si hay errores de stock, no permitimos continuar

    if (!this.datosEnvio.direccion) {
      alert('Por favor, introduce una dirección de envío.');
      return;
    }

    this.cargando.set(true);

// pago.ts -> dentro de realizarPago()

    const totalLimpio = Number(this.totalCarrito().toFixed(2));

    const pedidoDTO = {
      total: totalLimpio,
      direccionEnvio: this.datosEnvio.direccion,
      notaCliente: this.datosEnvio.nota,
      items: this.carritoItems().map(item => ({
        // CAMBIO CLAVE: En el DTO de Java se llama 'idProducto', no 'productoId'
        idProducto: item.productoId || item.id,
        cantidad: item.cantidad,
        // Añadimos el precio unitario ya que el DTO lo espera
        precioUnitario: item.precio
      }))
    };

    console.log('Enviando DTO corregido:', pedidoDTO);

    console.log('Enviando pedido al servidor:', pedidoDTO); // Revisa esto en la consola

    this.pedidoService.crearPedido(pedidoDTO).subscribe({
      next: (pedidoCreado: any) => {
        const transaccionId = 'TRANS-' + Math.random().toString(36).substr(2, 9).toUpperCase();

        const pagoData = {
          pedido: { idPedido: pedidoCreado.idPedido },
          importe: this.totalCarrito(),
          metodoPago: 'TARJETA',
          estadoPago: 'COMPLETADO',
          idTransaccion: transaccionId,
          detalles: 'Pago realizado con éxito'
        };

        this.pagoService.procesarPagoSimulado(pagoData).subscribe({
          next: () => {
            this.carritoService.limpiarCarrito();
            this.router.navigate(['/mis-pedidos']);
          },
          error: (err) => {
            this.cargando.set(false);
            console.error('Error en el pago:', err);
          }
        });
      },
      error: (err) => {
        this.cargando.set(false);
        console.error('Error al crear pedido:', err);
        // Si el servidor devuelve error de stock (aunque hayamos validado en front), lo capturamos aquí
        if (err.status === 400) {
          alert(err.error?.error || 'Error al procesar el pedido. Verifica el stock.');
        }
      }
    });
  }
}
