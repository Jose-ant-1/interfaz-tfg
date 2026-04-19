export interface Material {
  id?: number;
  nombreMaterial: string;
  tipo: string;
  descripcion: string;
  color: string;
  precioPorGramo: number;
  stockGramo: number;
  propiedades?: string; // Añadido para coincidir con Java
  imagen?: string;      // Añadido para coincidir con Java
  disponible: boolean;
  fechaCreacion?: string; // Las fechas de Java se reciben como string en TS
}

export interface Tecnologia {
  id?: number;
  nombre: string;
  descripcion: string;
  especificacion: string;
  disponible: boolean;
}
