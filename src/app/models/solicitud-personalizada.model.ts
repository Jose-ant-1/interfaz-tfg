import { Material, Tecnologia } from './configuracion.model';
import { Usuario } from './usuario.model'; // Asumiendo que tienes este modelo

export interface SolicitudPersonalizada {
  id?: number;
  usuario?: Usuario;
  numeroSolicitud?: string;
  tipoServicio?: string;
  material?: Material;
  tecnologia?: Tecnologia;
  descripcion: string;
  requisitosEspeciales?: string;
  acabado?: string;
  urgente: boolean;
  estado: string; // 'EVALUANDO', 'PRESUPUESTADO', etc.
  fechaSolicitud?: string;
  fechaActualizacion?: string;
  precio?: number;
}
