import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface JwtPayload {
  sub: string; // Nombre de usuario (identificador principal)
  role: string;
  exp?: number;
  email?: string; // Email del usuario
  nombreUsuario?: string; // Nombre de usuario
}

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  nombreUsuario: string;
  contrasena: string; // En producción esto debería estar hasheado
  rol: string;
  estado?: 'ACTIVO' | 'PENDIENTE' | 'RECHAZADO' | 'SUSPENDIDO'; // Estado de la cuenta
  fechaRegistro: string;
  motivoRechazo?: string; // Si fue rechazado, el motivo
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = `${environment.apiUrl}/auth`;
  private tokenKey = 'fit_token';
  private usersKey = 'fit_users'; // Clave para guardar usuarios en localStorage
  private _currentUser$ = new BehaviorSubject<JwtPayload | null>(null);

  constructor(private http: HttpClient) {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      this._currentUser$.next(this.decodeToken(token));
    }
  }

  // Obtener todos los usuarios guardados
  private getUsers(): User[] {
    try {
      const usersJson = localStorage.getItem(this.usersKey);
      if (!usersJson) {
        return [];
      }
      return JSON.parse(usersJson);
    } catch (error) {
      console.error('Error al leer usuarios de localStorage:', error);
      return [];
    }
  }

  // Guardar usuarios en localStorage
  private saveUsers(users: User[]): void {
    try {
      localStorage.setItem(this.usersKey, JSON.stringify(users));
    } catch (error) {
      console.error('Error al guardar usuarios en localStorage:', error);
      throw new Error('No se pudo guardar el usuario. Verifica que localStorage esté disponible.');
    }
  }

  // Generar ID único para usuario
  private generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Generar nombre de usuario automático si no se proporciona
  private generateUsername(email: string, nombre: string, apellido: string): string {
    const base = email.split('@')[0] || `${nombre}${apellido}`.toLowerCase().replace(/\s/g, '');
    return base + '_' + Math.random().toString(36).substr(2, 4);
  }

  // Crear token mock
  private createMockToken(email: string, nombreUsuario: string, role: string): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ 
      sub: nombreUsuario,
      email: email,
      nombreUsuario: nombreUsuario,
      role: role,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
    }));
    return `${header}.${payload}.mock-signature`;
  }

  register(payload: any): Observable<any> {
    // Usar directamente almacenamiento local ya que no hay backend disponible
    // Si en el futuro hay backend, se puede cambiar esta lógica
    return this.registerLocal(payload);
  }

  // Registro local sin backend
  private registerLocal(payload: any): Observable<any> {
    return new Observable(observer => {
      try {
        // Validar que payload tenga los datos necesarios
        if (!payload) {
          observer.error(new Error('No se recibieron datos para el registro'));
          return;
        }

        if (!payload.email || !payload.email.trim()) {
          observer.error(new Error('El email es requerido'));
          return;
        }

        if (!payload.contrasena || payload.contrasena.length < 6) {
          observer.error(new Error('La contraseña debe tener al menos 6 caracteres'));
          return;
        }

        const users = this.getUsers();
        
        // Verificar si el email ya existe
        const emailNormalized = payload.email.toLowerCase().trim();
        const emailExists = users.some(u => u.email && u.email.toLowerCase() === emailNormalized);
        if (emailExists) {
          observer.error(new Error('El email ya está registrado'));
          return;
        }

        // Generar nombre de usuario si no se proporciona
        let nombreUsuario = payload.nombreUsuario || this.generateUsername(
          payload.email, 
          payload.nombre || '', 
          payload.apellido || ''
        );

        // Verificar si el nombre de usuario ya existe
        const usernameExists = users.some(u => u.nombreUsuario && u.nombreUsuario.toLowerCase() === nombreUsuario.toLowerCase());
        if (usernameExists) {
          // Si existe, agregar un número
          let counter = 1;
          let newUsername = nombreUsuario;
          while (users.some(u => u.nombreUsuario && u.nombreUsuario.toLowerCase() === newUsername.toLowerCase())) {
            newUsername = nombreUsuario + counter;
            counter++;
            if (counter > 1000) break; // Prevenir loop infinito
          }
          nombreUsuario = newUsername;
        }

        // Crear nuevo usuario
        const newUser: User = {
          id: this.generateUserId(),
          nombre: payload.nombre || '',
          apellido: payload.apellido || '',
          email: emailNormalized,
          nombreUsuario: nombreUsuario,
          contrasena: payload.contrasena, // En producción esto debería estar hasheado
          rol: payload.rol || 'CLIENTE',
          estado: payload.rol === 'ENTRENADOR' ? 'PENDIENTE' : 'ACTIVO', // Entrenadores requieren aprobación
          fechaRegistro: new Date().toISOString()
        };

        // Guardar usuario
        try {
          users.push(newUser);
          this.saveUsers(users);
        } catch (saveError: any) {
          observer.error(new Error('No se pudo guardar el usuario: ' + (saveError?.message || 'Error desconocido')));
          return;
        }

        // NO autenticar automáticamente - solo retornar información del usuario
        // El usuario debe iniciar sesión manualmente después del registro
        observer.next({ 
          user: {
            id: newUser.id,
            email: newUser.email,
            nombreUsuario: newUser.nombreUsuario,
            rol: newUser.rol,
            estado: newUser.estado,
            nombre: newUser.nombre,
            apellido: newUser.apellido
          },
          message: newUser.estado === 'PENDIENTE' 
            ? 'Registro exitoso. Tu cuenta será revisada en 2-3 días hábiles.' 
            : 'Registro exitoso. Ya puedes iniciar sesión.'
        });
        observer.complete();
      } catch (error: any) {
        console.error('Error en registerLocal:', error);
        const errorMessage = error?.message || 'Error desconocido al registrar usuario';
        observer.error(new Error(errorMessage));
      }
    });
  }

  login(payload: any): Observable<any> {
    // Intentar primero con el backend
    return this.http.post(`${this.api}/login`, payload).pipe(
      tap((res: any) => {
        if (res?.token) {
          localStorage.setItem(this.tokenKey, res.token);
          this._currentUser$.next(this.decodeToken(res.token));
        }
      }),
      catchError((error) => {
        // Si falla, usar almacenamiento local
        console.log('Backend no disponible, usando almacenamiento local');
        return this.loginLocal(payload);
      })
    );
  }

  // Login local sin backend
  private loginLocal(payload: any): Observable<any> {
    try {
      const users = this.getUsers();
      const email = payload.email?.toLowerCase().trim();
      const nombreUsuario = payload.nombreUsuario?.toLowerCase().trim();
      const contrasena = payload.contrasena;
      const rolSeleccionado = payload.rol || 'CLIENTE';

      // Buscar usuario por email o nombre de usuario
      const user = users.find(u => 
        (u.email.toLowerCase() === email || u.nombreUsuario.toLowerCase() === nombreUsuario) &&
        u.contrasena === contrasena &&
        u.rol.toUpperCase() === rolSeleccionado.toUpperCase()
      );

      if (!user) {
        return throwError(() => new Error('Credenciales incorrectas o rol no coincide'));
      }

      // Verificar estado de la cuenta (especialmente para entrenadores)
      if (user.estado === 'PENDIENTE') {
        // Guardar info temporalmente para mostrarla en la página
        localStorage.setItem('pending_user_email', user.email);
        return throwError(() => ({ 
          code: 'PENDING_APPROVAL',
          message: 'Tu cuenta está pendiente de aprobación',
          email: user.email
        }));
      }

      if (user.estado === 'RECHAZADO') {
        localStorage.setItem('rejected_user_email', user.email);
        localStorage.setItem('rejected_reason', user.motivoRechazo || 'No especificado');
        return throwError(() => ({ 
          code: 'ACCOUNT_REJECTED',
          message: 'Tu solicitud fue rechazada',
          motivo: user.motivoRechazo
        }));
      }

      if (user.estado === 'SUSPENDIDO') {
        return throwError(() => new Error('Tu cuenta ha sido suspendida. Contacta a soporte.'));
      }

      // Solo permitir login si está ACTIVO
      if (user.estado !== 'ACTIVO') {
        return throwError(() => new Error('Tu cuenta no está activa.'));
      }

      // Crear token y autenticar
      const token = this.createMockToken(user.email, user.nombreUsuario, user.rol);
      localStorage.setItem(this.tokenKey, token);
      
      const jwtPayload = this.decodeToken(token);
      if (jwtPayload) {
        this._currentUser$.next(jwtPayload);
      }

      return of({ 
        token: token, 
        user: {
          id: user.id,
          email: user.email,
          nombreUsuario: user.nombreUsuario,
          rol: user.rol,
          estado: user.estado,
          nombre: user.nombre,
          apellido: user.apellido
        }
      });
    } catch (error) {
      return throwError(() => new Error('Error al iniciar sesión: ' + (error as Error).message));
    }
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this._currentUser$.next(null);
  }

  get token() {
    return localStorage.getItem(this.tokenKey) || null;
  }

  currentUser(): Observable<JwtPayload | null> {
    return this._currentUser$.asObservable();
  }

  getRole(): string | null {
    return this._currentUser$.value?.role || null;
  }

  // Obtener el email del token
  getEmail(): string | null {
    return this._currentUser$.value?.email || null;
  }

  // Obtener el nombre de usuario del token
  getNombreUsuario(): string | null {
    return this._currentUser$.value?.nombreUsuario || this._currentUser$.value?.sub || null;
  }

  decodeToken(token: string): JwtPayload | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded as JwtPayload;
    } catch (e) {
      return null;
    }
  }

  setCurrentUser(payload: JwtPayload | null): void {
    this._currentUser$.next(payload);
  }
}
