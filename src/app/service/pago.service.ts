import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pago } from '../models/pago.model';

@Injectable({
  providedIn: 'root',
})
export class PagoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/pagos';

  // Registrar un pago en la base de datos
  procesarPagoSimulado(pago: Pago): Observable<Pago> {
    return this.http.post<Pago>(this.apiUrl, pago);
  }
}
