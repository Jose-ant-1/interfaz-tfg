import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SolicitudPersonalizada } from '../models/solicitud-personalizada.model';

@Injectable({
  providedIn: 'root'
})
export class SolicitudPersoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/solicitudes';

  // Obtener todas (para el Admin)
  findAll(): Observable<SolicitudPersonalizada[]> {
    return this.http.get<SolicitudPersonalizada[]>(this.apiUrl);
  }

  // Obtener una por ID
  findById(id: number): Observable<SolicitudPersonalizada> {
    return this.http.get<SolicitudPersonalizada>(`${this.apiUrl}/${id}`);
  }

  // Crear la solicitud (lo que usaremos en el formulario)
  create(solicitud: SolicitudPersonalizada): Observable<SolicitudPersonalizada> {
    return this.http.post<SolicitudPersonalizada>(this.apiUrl, solicitud);
  }

  // Actualizar (para que el admin ponga el precio o cambie el estado)
  update(id: number, solicitud: SolicitudPersonalizada): Observable<SolicitudPersonalizada> {
    return this.http.put<SolicitudPersonalizada>(`${this.apiUrl}/${id}`, solicitud);
  }

  // Borrar
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
