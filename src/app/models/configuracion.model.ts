export interface Material {
  id?: number;
  nombreMaterial: string;
  tipo: string;
  descripcion: string;
  color: string;
  precioPorGramo: number;
  stockGramo: number;
  propiedades: string;
  disponible: boolean;
  fechaCreacion?: string;
}

export interface Tecnologia {
  id?: number;
  nombre: string;
  descripcion: string;
  especificacion: string;
  disponible: boolean;
}
