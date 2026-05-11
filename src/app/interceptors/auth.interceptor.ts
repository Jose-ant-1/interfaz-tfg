import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../service/auth.service'; // Ajusta la ruta a tu servicio
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Obtenemos el token del localStorage
  const token = localStorage.getItem('token');

  // 2. Clonamos la petición para añadir el token si existe
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // 3. Enviamos la petición y vigilamos si hay errores
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el error es 401 o 403, el token no es válido o ha caducado
      if (error.status === 401 || error.status === 403) {
        console.warn('Sesión caducada o inválida. Redirigiendo...');
        authService.logout(); // Limpia los datos de sesión
        router.navigate(['/login']); // Te saca de la página actual
      }
      return throwError(() => error);
    }),
  );
};
