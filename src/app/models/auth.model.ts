export interface LoginResponse {
  token: string;    // El JWT que genera tu Spring Boot
  type: string;     // Normalmente "Bearer"
  id: number;       // ID del usuario en la base de datos
  email: string;    // Email del usuario
  nombre: string;   // Nombre para mostrar en el menú
  roles: string[];  // Roles (ROLE_USER, ROLE_ADMIN) para proteger rutas
}

export interface LoginRequest {
  email: string;
  password: string;
}
