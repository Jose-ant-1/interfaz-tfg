export interface ValoracionModel {
  id?: number;
  puntuacion: number;
  comentario: string;
  fechaValoracion?: string;
  usuario?: { id: number; nombre?: string };   // Simplificado para que acepte {id: X}
  producto?: { id: number };
}
