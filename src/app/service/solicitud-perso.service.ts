import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SolicitudPersonalizada } from '../models/solicitud-personalizada.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SolicitudPersoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/solicitudes`;

  // para el Admin
  findAll(): Observable<SolicitudPersonalizada[]> {
    return this.http.get<SolicitudPersonalizada[]>(this.apiUrl);
  }

  create(solicitud: SolicitudPersonalizada): Observable<SolicitudPersonalizada> {
    return this.http.post<SolicitudPersonalizada>(this.apiUrl, solicitud);
  }

}
