import { Material, Tecnologia } from './configuracion.model';
import { Usuario } from './usuario.model';

export interface SolicitudPersonalizada {
  id?: number;
  usuario?: Usuario;
  numeroSolicitud?: string;
  tipoServicio: 'IMPRESION_3D' | 'DISENYO_CAD';
  material?: Material;
  tecnologia?: Tecnologia;
  descripcion: string;
  requisitosEspeciales?: string;
  acabado?: string;
  estado: string;
  fechaSolicitud?: string;
  fechaActualizacion?: string;
  precio?: number;
}
