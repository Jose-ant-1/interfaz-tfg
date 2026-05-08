import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Material, Tecnologia } from '../models/configuracion.model';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminConfigService {
  private http = inject(HttpClient);

  // Rutas basadas en tus Controllers de Java
  private API_MATERIALES = `${environment.apiUrl}/materiales`;
  private API_TECNOLOGIAS = `${environment.apiUrl}/tecnologias`;

  // Métodos Materiales
  getMateriales() {
    return this.http.get<Material[]>(this.API_MATERIALES);
  }
  saveMaterial(m: Material) {
    return this.http.post<Material>(this.API_MATERIALES, m);
  }
  updateMaterial(id: number, m: Material) {
    return this.http.put<Material>(`${this.API_MATERIALES}/${id}`, m);
  }
  deleteMaterial(id: number) {
    return this.http.delete(`${this.API_MATERIALES}/${id}`);
  }

  // Métodos Tecnologías
  getTecnologias() {
    return this.http.get<Tecnologia[]>(this.API_TECNOLOGIAS);
  }
  saveTecnologia(t: Tecnologia) {
    return this.http.post<Tecnologia>(this.API_TECNOLOGIAS, t);
  }
  deleteTecnologia(id: number) {
    return this.http.delete(`${this.API_TECNOLOGIAS}/${id}`);
  }
}
