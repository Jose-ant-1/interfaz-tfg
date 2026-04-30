export interface ArchivoSolicitud {
  id?: number;
  nombreArchivo: string;
  tipoArchivo: string;
  url: string;
  tamanio: number;
  notas?: string;
  fechaSubida?: string;
  id_solicitud?: number;
}
