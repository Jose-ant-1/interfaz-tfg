// archivo-solicitud.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {ArchivoSolicitud} from '../models/archivo-solicitud';

@Injectable({ providedIn: 'root' })
export class ArchivoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/archivos';

  // Cambia el tipo del parámetro aquí para que no pida una SolicitudPersonalizada
  guardarReferenciaArchivo(archivo: any): Observable<any> {
    return this.http.post(this.apiUrl, archivo);
  }

  obtenerArchivos(): Observable<ArchivoSolicitud[]> {
    return this.http.get<ArchivoSolicitud[]>(this.apiUrl);
  }

}
