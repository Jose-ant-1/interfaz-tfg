import { Component, inject, signal } from '@angular/core';
import { CarritoService } from '../../service/carrito.service';
import { PagoService } from '../../service/pago.service';
import { PedidoService } from '../../service/pedido.service';
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
  private router = inject(Router);

  // Señales para el formulario
  direccion = signal('');
  notas = signal('');

  // Datos de tarjeta
  numeroTarjeta = signal('');
  fechaExpiracion = signal(''); // Formato MM/YY
  cvc = signal('');

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
  datosEnvio = { direccion: '', nota: '' };

  async realizarPago() {
    // Si hay errores de stock, no permitimos continuar

    // Validar Dirección
    if (!this.datosEnvio.direccion) {
      alert('Por favor, introduce una dirección de envío.');
      return;
    }

    // Validar Número de Tarjeta (16 dígitos sin contar espacios)
    const numLimpio = this.numeroTarjeta().replace(/\s/g, '');
    if (numLimpio.length !== 16) {
      alert('El número de tarjeta debe tener 16 dígitos.');
      return;
    }

    // Validar Fecha de Expiración (LA CLAVE DE TU PREGUNTA)
    if (!this.isFechaValida()) {
      alert('La tarjeta está caducada o la fecha no es válida (Formato: MM/YY).');
      return;
    }

    // Validar CVC
    if (this.cvc().length < 3) {
      alert('El código CVC debe tener 3 dígitos.');
      return;
    }

    if (!this.datosEnvio.direccion) {
      alert('Por favor, introduce una dirección de envío.');
      return;
    }

    this.cargando.set(true);

    const totalLimpio = Number(this.totalCarrito().toFixed(2));

    const pedidoDTO = {
      total: totalLimpio,
      direccionEnvio: this.datosEnvio.direccion,
      notaCliente: this.datosEnvio.nota,
      items: this.carritoItems().map((item) => ({
        // CAMBIO CLAVE: En el DTO de Java se llama 'idProducto', no 'productoId'
        idProducto: item.productoId || item.id,
        cantidad: item.cantidad,
        // Añadimos el precio unitario ya que el DTO lo espera
        precioUnitario: item.precio,
      })),
    };

    console.log('Enviando DTO corregido:', pedidoDTO);

    console.log('Enviando pedido al servidor:', pedidoDTO); // Revisa esto en la consola

    this.pedidoService.crearPedido(pedidoDTO).subscribe({
      next: (pedidoCreado: any) => {
        // Usamos slice para evitar el deprecated substr
        const randomPart = Math.random().toString(36).slice(2, 11).toUpperCase();
        const transaccionId = `TRANS-${randomPart}`;

        const pagoData = {
          pedido: { idPedido: pedidoCreado.idPedido },
          importe: this.totalCarrito(),
          metodoPago: 'TARJETA',
          estadoPago: 'COMPLETADO',
          idTransaccion: transaccionId,
          detalles: 'Pago realizado con éxito',
        };

        this.pagoService.procesarPagoSimulado(pagoData).subscribe({
          next: () => {
            this.carritoService.limpiarCarrito();
            this.router.navigate(['/mis-pedidos']);
          },
          error: (err) => {
            this.cargando.set(false);
            console.error('Error en el pago:', err);
          },
        });
      },
      error: (err) => {
        this.cargando.set(false);
        console.error('Error al crear pedido:', err);
        // Si el servidor devuelve error de stock (aunque hayamos validado en front), lo capturamos aquí
        if (err.status === 400) {
          alert(err.error?.error || 'Error al procesar el pedido. Verifica el stock.');
        }
      },
    });
  }
}
