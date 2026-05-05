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

  descargarArchivoBlob(id: number): Observable<Blob> {
    return this.http.get(`http://localhost:8080/api/archivos/download/${id}`, {
      responseType: 'blob',
    });
  }
}
