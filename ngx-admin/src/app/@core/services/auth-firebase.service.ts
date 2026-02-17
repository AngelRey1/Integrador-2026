import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

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

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {
    // Restaurar sesión si existe
    this.restoreSession();
    
    // Escuchar cambios de autenticación
    this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.firestore.collection('usuarios').doc(user.uid).valueChanges() as Observable<UserData>;
        }
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
    documentos?: {
      ine: { nombre: string; tipo: string; base64: string; tamano: number } | null;
      certificacion: { nombre: string; tipo: string; base64: string; tamano: number } | null;
    }
  }): Promise<AuthResult> {
    try {
      const { nombre, apellido, email, password, rol, documentos } = payload;
      
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

      await this.firestore.collection('usuarios').doc(credential.user.uid).set(userData);

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

      // Primero buscar en colección 'usuarios'
      let userDoc = await this.firestore.collection('usuarios').doc(credential.user.uid).get().toPromise();
      let userData = userDoc?.data() as UserData | undefined;

      // Si no está en usuarios, buscar en 'entrenadores'
      if (!userData) {
        const entrenadorDoc = await this.firestore.collection('entrenadores').doc(credential.user.uid).get().toPromise();
        const entrenadorData = entrenadorDoc?.data() as any;
        
        if (entrenadorData) {
          // Convertir datos de entrenador a formato UserData
          userData = {
            uid: credential.user.uid,
            email: entrenadorData.email || credential.user.email || '',
            nombre: entrenadorData.nombre || '',
            apellido: entrenadorData.apellidoPaterno || '',
            rol: 'ENTRENADOR',
            estado: entrenadorData.activo ? 'ACTIVO' : 'PENDIENTE',
            fechaRegistro: entrenadorData.fechaRegistro || new Date()
          };
        }
      }

      // Si tampoco está en entrenadores, buscar por email en entrenadores
      if (!userData) {
        const entrenadoresSnapshot = await this.firestore.collection('entrenadores', ref => 
          ref.where('email', '==', email).limit(1)
        ).get().toPromise();
        
        if (entrenadoresSnapshot && !entrenadoresSnapshot.empty) {
          const entrenadorData = entrenadoresSnapshot.docs[0].data() as any;
          userData = {
            uid: credential.user.uid,
            email: entrenadorData.email || credential.user.email || '',
            nombre: entrenadorData.nombre || '',
            apellido: entrenadorData.apellidoPaterno || '',
            rol: 'ENTRENADOR',
            estado: entrenadorData.activo ? 'ACTIVO' : 'PENDIENTE',
            fechaRegistro: entrenadorData.fechaRegistro || new Date()
          };
        }
      }

      if (!userData) {
        // Si aún no encontramos, crear un userData básico con los datos de Firebase Auth
        userData = {
          uid: credential.user.uid,
          email: credential.user.email || email,
          nombre: credential.user.displayName?.split(' ')[0] || 'Usuario',
          apellido: credential.user.displayName?.split(' ').slice(1).join(' ') || '',
          rol: rol as 'CLIENTE' | 'ENTRENADOR' | 'ADMIN',
          estado: 'ACTIVO',
          fechaRegistro: new Date()
        };
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
        message = 'Demasiados intentos. Intenta más tarde.';
      } else if (error.code === 'auth/invalid-credential') {
        message = 'Credenciales inválidas. Verifica tu correo y contraseña.';
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
