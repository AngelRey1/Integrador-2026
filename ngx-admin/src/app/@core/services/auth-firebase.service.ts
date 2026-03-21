import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

export interface AuthResult {
  success: boolean;
  message: string;
  user?: any;
}

export interface UserData {
  uid: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'CLIENTE' | 'ENTRENADOR' | 'ADMIN';
  estado: 'ACTIVO' | 'PENDIENTE' | 'RECHAZADO' | 'SUSPENDIDO';
  fechaRegistro: Date;
  motivoRechazo?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthFirebaseService {
  private currentUser$ = new BehaviorSubject<UserData | null>(null);
  private currentRole: string | null = null;
  private tokenKey = 'firebase_user_data';

  private mapClienteToUserData(uid: string, email: string | null | undefined, data: any): UserData {
    return {
      uid,
      email: data.email || email || '',
      nombre: data.nombre || '',
      apellido: data.apellidos || '',
      rol: 'CLIENTE',
      estado: 'ACTIVO',
      fechaRegistro: data.fechaRegistro || new Date(),
    };
  }

  private mapEntrenadorToUserData(uid: string, email: string | null | undefined, data: any): UserData {
    return {
      uid,
      email: data.email || email || '',
      nombre: data.nombre || '',
      apellido: data.apellidoPaterno || '',
      rol: 'ENTRENADOR',
      estado: data.activo ? 'ACTIVO' : 'PENDIENTE',
      fechaRegistro: data.fechaRegistro || new Date(),
      motivoRechazo: data.documentos?.motivoRechazo,
    };
  }

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {
    // Restaurar sesión si existe
    this.restoreSession();
    
    // Escuchar cambios de autenticación
    this.afAuth.authState.pipe(
      switchMap(user => {
        if (!user) {
          // Si no hay usuario, limpiar sesión
          this.clearSession();
          return of(null);
        }
        
        // Fuente canónica: users collection (todos los usuarios tienen un documento aquí)
        return this.firestore.collection('users').doc(user.uid).valueChanges().pipe(
          map(userData => userData as UserData),
          catchError(err => {
            console.warn('Error buscando usuario en users:', err);
            return of(null);
          })
        );
      }),
      catchError(err => {
        console.warn('Error en authState:', err);
        return of(null);
      })
    ).subscribe(userData => {
      if (userData) {
        this.currentUser$.next(userData);
        this.currentRole = userData.rol;
        this.saveSession(userData);
      }
    });
  }

  private restoreSession(): void {
    try {
      const savedData = localStorage.getItem(this.tokenKey);
      if (savedData) {
        const userData = JSON.parse(savedData) as UserData;
        this.currentUser$.next(userData);
        this.currentRole = userData.rol;
      }
    } catch (e) {
      console.warn('Error restaurando sesión:', e);
    }
  }

  private saveSession(userData: UserData): void {
    try {
      localStorage.setItem(this.tokenKey, JSON.stringify(userData));
    } catch (e) {
      console.warn('Error guardando sesión:', e);
    }
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUser$.next(null);
    this.currentRole = null;
  }

  async register(payload: { 
    nombre: string; 
    apellido: string; 
    email: string; 
    password: string; 
    rol: string;
    planSuscripcion?: string;
    documentos?: {
      ine: { nombre: string; tipo: string; base64: string; tamano: number } | null;
      certificacion: { nombre: string; tipo: string; base64: string; tamano: number } | null;
    }
  }): Promise<AuthResult> {
    try {
      const { nombre, apellido, email, password, rol, documentos, planSuscripcion } = payload;
      
      // Crear usuario en Firebase Auth
      const credential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      
      if (!credential.user) {
        return { success: false, message: 'Error al crear el usuario' };
      }

      // Crear documento de usuario en Firestore
      const userData: UserData = {
        uid: credential.user.uid,
        email: email,
        nombre: nombre,
        apellido: apellido,
        rol: rol as 'CLIENTE' | 'ENTRENADOR' | 'ADMIN',
        estado: rol === 'ENTRENADOR' ? 'PENDIENTE' : 'ACTIVO', // Entrenadores requieren aprobación
        fechaRegistro: new Date()
      };

      await this.firestore.collection('users').doc(credential.user.uid).set(userData);

      // Si es entrenador, crear documento en colección de entrenadores
      if (rol === 'ENTRENADOR') {
        const entrenadorData: any = {
          userId: credential.user.uid,
          nombre: nombre,
          apellidoPaterno: apellido,
          email: email,
          foto: '',
          descripcion: '',
          bio: '',
          deportes: [],
          especialidades: [],
          certificaciones: [],
          precio: 0,
          precioOnline: 0,
          modalidades: ['presencial'],
          ubicacion: {
            direccion: '',
            ciudad: ''
          },
          disponibilidad: {},
          calificacionPromedio: 0,
          totalReviews: 0,
          verificado: false,
          activo: false,
          fechaRegistro: new Date(),
          direccionEntrenamiento: '',
          planSuscripcion: planSuscripcion || 'free',
          limiteAlumnos: (planSuscripcion === 'pro' || planSuscripcion === 'anual') ? 999999 : 5,
          // Documentos de verificación
          documentos: {
            ine: documentos?.ine || null,
            certificacion: documentos?.certificacion || null,
            fechaSubida: new Date(),
            estadoVerificacion: 'PENDIENTE'
          }
        };

        await this.firestore.collection('entrenadores').doc(credential.user.uid).set(entrenadorData);

        return {
          success: true,
          message: 'Registro exitoso. Tu cuenta de entrenador está pendiente de aprobación.'
        };
      }

      this.currentUser$.next(userData);
      this.currentRole = rol;
      this.saveSession(userData);

      return {
        success: true,
        message: 'Registro exitoso. Bienvenido!',
        user: userData
      };
    } catch (error: any) {
      console.error('Error en registro:', error);
      
      let message = 'Error al registrar. Intenta de nuevo.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'Este correo ya está registrado.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'El correo electrónico no es válido.';
      } else if (error.code === 'auth/weak-password') {
        message = 'La contraseña es muy débil.';
      }
      
      return { success: false, message };
    }
  }

  async login(email: string, password: string, rol: string): Promise<AuthResult> {
    try {
      const credential = await this.afAuth.signInWithEmailAndPassword(email, password);
      
      if (!credential.user) {
        return { success: false, message: 'Error al iniciar sesión' };
      }

      // Primero buscar en colección canónica 'users'
      let userDoc = await this.firestore.collection('users').doc(credential.user.uid).get().toPromise();
      let userData = userDoc?.data() as UserData | undefined;

      if (!userData) {
        // Si el usuario no existe en 'users', crear un registro básico
        // (Esto maneja casos de migraciones incompletas)
        userData = {
          uid: credential.user.uid,
          email: credential.user.email || email,
          nombre: credential.user.displayName?.split(' ')[0] || 'Usuario',
          apellido: credential.user.displayName?.split(' ').slice(1).join(' ') || '',
          rol: (rol !== 'ANY' ? rol : 'CLIENTE') as 'CLIENTE' | 'ENTRENADOR' | 'ADMIN',
          estado: 'ACTIVO',
          fechaRegistro: new Date()
        };
        await this.firestore.collection('users').doc(credential.user.uid).set(userData, { merge: true });
      }

      // Verificar rol si es necesario
      if (rol !== 'ANY' && userData.rol !== rol) {
        await this.afAuth.signOut();
        return { success: false, message: `Esta cuenta no es de tipo ${rol.toLowerCase()}` };
      }

      // Verificar estado de la cuenta
      if (userData.estado === 'PENDIENTE') {
        await this.afAuth.signOut();
        return { success: false, message: 'Tu cuenta está pendiente de aprobación' };
      }

      if (userData.estado === 'RECHAZADO') {
        await this.afAuth.signOut();
        return { success: false, message: `Tu solicitud fue rechazada: ${userData.motivoRechazo || 'Sin motivo especificado'}` };
      }

      if (userData.estado === 'SUSPENDIDO') {
        await this.afAuth.signOut();
        return { success: false, message: 'Tu cuenta ha sido suspendida' };
      }

      this.currentUser$.next(userData);
      this.currentRole = userData.rol;
      this.saveSession(userData);

      return {
        success: true,
        message: 'Inicio de sesión exitoso',
        user: userData
      };
    } catch (error: any) {
      console.error('Error en login:', error);
      
      let message = 'Error al iniciar sesión. Intenta de nuevo.';
      if (error.code === 'auth/user-not-found') {
        message = 'No existe una cuenta con este correo.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Contraseña incorrecta.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'El correo electrónico no es válido.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Demasiados intentos fallidos. Por seguridad, espera 5-10 minutos antes de intentar de nuevo.';
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-login-credentials') {
        message = 'Email o contraseña incorrectos. Verifica tus datos e intenta de nuevo.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Error de conexión. Verifica tu internet e intenta de nuevo.';
      } else if (error.message?.includes('permission') || error.code?.includes('permission')) {
        message = 'Error de permisos. Contacta al administrador.';
      }
      
      return { success: false, message };
    }
  }

  async resetPassword(email: string): Promise<AuthResult> {
    try {
      await this.afAuth.sendPasswordResetEmail(email);
      return {
        success: true,
        message: 'Se ha enviado un correo para restablecer tu contraseña'
      };
    } catch (error: any) {
      console.error('Error al restablecer contraseña:', error);
      
      let message = 'Error al enviar el correo. Intenta de nuevo.';
      if (error.code === 'auth/user-not-found') {
        message = 'No existe una cuenta con este correo.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'El correo electrónico no es válido.';
      }
      
      return { success: false, message };
    }
  }

  async logout(): Promise<void> {
    await this.afAuth.signOut();
    this.clearSession();
  }

  isAuthenticated(): boolean {
    return this.currentUser$.value !== null;
  }

  getRole(): string | null {
    return this.currentRole || this.currentUser$.value?.rol || null;
  }

  getCurrentUser(): Observable<UserData | null> {
    return this.currentUser$.asObservable();
  }

  getCurrentUserValue(): UserData | null {
    return this.currentUser$.value;
  }

  getUid(): string | null {
    return this.currentUser$.value?.uid || null;
  }

  getNombreUsuario(): string | null {
    const user = this.currentUser$.value;
    return user ? `${user.nombre} ${user.apellido}` : null;
  }

  getEmail(): string | null {
    return this.currentUser$.value?.email || null;
  }
}
