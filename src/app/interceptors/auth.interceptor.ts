import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const rawToken = localStorage.getItem('token');

  if (rawToken) {
    // 1. Limpieza extrema: eliminamos comillas, espacios, saltos de línea (\n) y retornos de carro (\r)
    const cleanToken = rawToken.replace(/["']/g, '').replace(/\s+/g, '');

    const cloned = req.clone({
      setHeaders: {
        // 2. Concatenamos en una sola línea literal
        'Authorization': `Bearer ${cleanToken}`
      }
    });

    return next(cloned);
  }
  return next(req);
};
