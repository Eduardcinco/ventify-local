import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor para agregar withCredentials: true a todas las peticiones HTTP
 * Esto permite que las cookies (incluyendo el JWT) se envíen automáticamente
 * en cada request, resolviendo errores 401 de autenticación.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Clonar la petición y agregar withCredentials
  const authReq = req.clone({
    withCredentials: true
  });

  // Continuar con la petición modificada
  return next(authReq);
};
