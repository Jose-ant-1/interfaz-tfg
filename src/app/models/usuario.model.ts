export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellidos: string;
  contrasenia?: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  codigoPostal: number;
  rol: string;
  estado: string;
}
