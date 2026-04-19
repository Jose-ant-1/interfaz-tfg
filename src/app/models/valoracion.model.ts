// src/app/models/valoracion.model.ts
export interface ValoracionModel {
  id?: number;
  puntuacion: number;
  comentario: string;
  fechaValoracion?: string;
  usuario?: { id: number };   // Simplificado para que acepte {id: X}
  producto?: { id: number };  // Simplificado para que acepte {id: X}
}
