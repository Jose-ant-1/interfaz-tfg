import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {ArchivoSolicitud} from '../models/archivo-solicitud';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class ArchivoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/archivos`;

  obtenerArchivos(): Observable<ArchivoSolicitud[]> {
    return this.http.get<ArchivoSolicitud[]>(this.apiUrl);
  }

  subirArchivoReal(file: File, solicitudId: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file); // El archivo binario
    formData.append('solicitudId', solicitudId.toString()); // El ID para vincularlo

    // Cambiamos la URL a un endpoint que acepte "Multipart"
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  descargarArchivoSeguro(url: string): Observable<Blob> {
    // Importante: responseType: 'blob' para que Angular no intente leerlo como JSON
    return this.http.get(url, { responseType: 'blob' });
  }


}
