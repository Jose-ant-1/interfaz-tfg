export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellidos: string;
  contrasenia?: string; // <--- AÑADE ESTO (Opcional con ?)
  telefono: string;
  direccion: string;
  ciudad: string;
  codigoPostal: number;
  rol: string;
  estado: string;
}
