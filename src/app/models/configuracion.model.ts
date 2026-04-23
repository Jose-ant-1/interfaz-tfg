export interface Material {
  id?: number;
  nombreMaterial: string; // nombre_material en Java
  tipo: string; // Filamento, Resina, etc.
  descripcion: string;
  color: string;
  precioPorGramo: number; // precio_por_gramo (Double)
  stockGramo: number; // stock_gramo (Double)
  propiedades: string; // TEXT en Java para propiedades mecánicas
  disponible: boolean;
  fechaCreacion?: string; // LocalDate se recibe como ISO string

  // Nota: No incluimos la relación 'productos' o 'solicitudes' para evitar
  // recursividad infinita en el JSON, a menos que el Back use DTOs.
}

export interface Tecnologia {
  id?: number;
  nombre: string;
  descripcion: string; // TEXT
  especificacion: string; // TEXT para detalles técnicos (velocidad, precisión...)
  disponible: boolean;
}
