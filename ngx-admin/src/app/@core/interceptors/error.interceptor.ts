import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastrService: NbToastrService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ha ocurrido un error';
        let shouldShowToast = true;

        if (error.error instanceof ErrorEvent) {
          // Error del lado del cliente
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Error del lado del servidor
          switch (error.status) {
            case 401:
              errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
              this.authService.logout();
              this.router.navigate(['/auth/login']);
              break;
            case 403:
              errorMessage = 'No tienes permisos para realizar esta acción.';
              break;
            case 404:
              // Si es 404 y la URL contiene /api/v1, probablemente no hay backend
              // Solo mostrar error si es una ruta crítica (auth, etc.)
              if (req.url.includes('/auth/')) {
                errorMessage = 'Error de autenticación. Verifica tu conexión.';
              } else {
                // Para otros endpoints, no mostrar error (el componente manejará con datos mock)
                shouldShowToast = false;
                console.warn('Backend no disponible, usando datos mock:', req.url);
              }
              break;
            case 500:
              errorMessage = 'Error interno del servidor. Por favor, intenta más tarde.';
              break;
            case 504:
              // Gateway Timeout - generalmente significa que no hay backend disponible
              // No mostrar error, el componente manejará con datos mock
              shouldShowToast = false;
              console.warn('Backend no disponible (Gateway Timeout), usando datos mock:', req.url);
              break;
            case 502:
            case 503:
              // Bad Gateway o Service Unavailable - no hay backend disponible
              shouldShowToast = false;
              console.warn('Backend no disponible, usando datos mock:', req.url);
              break;
            case 0:
              // Error de conexión (CORS, servidor no disponible, etc.)
              // No mostrar error si no hay backend disponible
              shouldShowToast = false;
              console.warn('Backend no disponible, usando datos mock:', req.url);
              break;
            default:
              // Solo mostrar errores críticos (no 5xx de servidor no disponible)
              if (error.status >= 500 && error.status < 600) {
                // Errores del servidor, pero no críticos si no hay backend
                shouldShowToast = false;
                console.warn('Error del servidor, usando datos mock:', req.url, error.status);
              } else {
                errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
              }
          }
        }

        // Solo mostrar notificación si es un error crítico
        if (shouldShowToast) {
          this.toastrService.danger(errorMessage, 'Error', {
            duration: 5000,
          });
        }

        return throwError(() => error);
      })
    );
  }
}

