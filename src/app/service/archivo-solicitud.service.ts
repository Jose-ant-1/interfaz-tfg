import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SolicitudPersonalizada } from '../models/solicitud-personalizada.model';

@Injectable({ providedIn: 'root' })
export class ArchivoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/archivos';

  // En una app real, aquí subirías el archivo a un storage (S3, Firebase, o carpeta local)
  // y luego guardarías la URL en la base de datos a través de la API.
  guardarReferenciaArchivo(archivo: SolicitudPersonalizada): Observable<SolicitudPersonalizada> {
    return this.http.post<SolicitudPersonalizada>(this.apiUrl, archivo);
  }
}
