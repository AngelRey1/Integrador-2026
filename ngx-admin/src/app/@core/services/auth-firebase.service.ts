import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap, map, tap, catchError } from 'rxjs/operators';

export interface User {
    uid: string;
    email: string;
    nombre: string;
    apellido: string;
    nombreUsuario?: string;
    telefono?: string;
    fotoUrl?: string;
    rol: 'CLIENTE' | 'ENTRENADOR' | 'ADMIN';
    estado: 'ACTIVO' | 'PENDIENTE' | 'SUSPENDIDO' | 'RECHAZADO';
    fechaRegistro: Date;
    ultimoAcceso?: Date;
    motivoRechazo?: string;
}

export interface RegisterPayload {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    rol: 'CLIENTE' | 'ENTRENADOR';
    telefono?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthFirebaseService {
    private currentUser$ = new BehaviorSubject<User | null>(null);
    private isLoading$ = new BehaviorSubject<boolean>(true);

    constructor(
        private afAuth: AngularFireAuth,
        private firestore: AngularFirestore,
        private router: Router
    ) {
        // Escuchar cambios en el estado de autenticación
        this.afAuth.authState.pipe(
            switchMap(firebaseUser => {
                if (firebaseUser) {
                    // Usuario autenticado, obtener datos de Firestore
                    return this.firestore.doc<User>(`users/${firebaseUser.uid}`).valueChanges().pipe(
                        map(userData => userData ? { ...userData, uid: firebaseUser.uid } : null)
                    );
                } else {
                    return of(null);
                }
            }),
            tap(user => {
                this.currentUser$.next(user);
                this.isLoading$.next(false);
            }),
            catchError(error => {
                console.error('Error en authState:', error);
                this.isLoading$.next(false);
                return of(null);
            })
        ).subscribe();
    }

    // ==================== REGISTRO ====================

    async register(payload: RegisterPayload): Promise<{ success: boolean; message: string; user?: User }> {
        try {
            // 1. Crear usuario en Firebase Auth
            const credential = await this.afAuth.createUserWithEmailAndPassword(
                payload.email,
                payload.password
            );

            if (!credential.user) {
                throw new Error('No se pudo crear el usuario');
            }

            const uid = credential.user.uid;

            // 2. Crear documento en Firestore
            const userData: Omit<User, 'uid'> = {
                email: payload.email.toLowerCase().trim(),
                nombre: payload.nombre.trim(),
                apellido: payload.apellido.trim(),
                telefono: payload.telefono || '',
                fotoUrl: '',
                rol: payload.rol,
                // Entrenadores requieren aprobación, clientes están activos desde el inicio
                estado: payload.rol === 'ENTRENADOR' ? 'PENDIENTE' : 'ACTIVO',
                fechaRegistro: new Date(),
            };

            await this.firestore.doc(`users/${uid}`).set(userData);

            // 3. Si es entrenador, crear también perfil público vacío
            if (payload.rol === 'ENTRENADOR') {
                await this.firestore.collection('entrenadores').doc(uid).set({
                    userId: uid,
                    nombre: payload.nombre,
                    apellidoPaterno: payload.apellido,
                    foto: '',
                    descripcion: '',
                    deportes: [],
                    especialidades: [],
                    precio: 0,
                    precioOnline: 0,
                    modalidades: [],
                    ubicacion: {},
                    disponibilidad: {},
                    calificacionPromedio: 0,
                    totalReviews: 0,
                    verificado: false,
                    activo: false,
                    fechaRegistro: new Date()
                });
            }

            const message = payload.rol === 'ENTRENADOR'
                ? 'Registro exitoso. Tu cuenta será revisada en 2-3 días hábiles.'
                : 'Registro exitoso. ¡Ya puedes iniciar sesión!';

            return {
                success: true,
                message,
                user: { ...userData, uid }
            };

        } catch (error: any) {
            console.error('Error en registro:', error);

            // Traducir errores de Firebase al español
            let message = 'Error al registrar usuario';
            if (error.code === 'auth/email-already-in-use') {
                message = 'Este correo electrónico ya está registrado';
            } else if (error.code === 'auth/weak-password') {
                message = 'La contraseña debe tener al menos 6 caracteres';
            } else if (error.code === 'auth/invalid-email') {
                message = 'El correo electrónico no es válido';
            }

            return { success: false, message };
        }
    }

    // ==================== LOGIN ====================

    async login(email: string, password: string, rolEsperado?: string): Promise<{ success: boolean; message: string; user?: User }> {
        try {
            // 1. Autenticar con Firebase
            const credential = await this.afAuth.signInWithEmailAndPassword(email, password);

            if (!credential.user) {
                throw new Error('No se pudo iniciar sesión');
            }

            const uid = credential.user.uid;

            // 2. Obtener datos del usuario de Firestore
            const userDoc = await this.firestore.doc<User>(`users/${uid}`).get().toPromise();
            const userData = userDoc?.data();

            if (!userData) {
                await this.afAuth.signOut();
                return { success: false, message: 'Usuario no encontrado en la base de datos' };
            }

            // 3. Verificar rol si se especificó
            if (rolEsperado && userData.rol !== rolEsperado) {
                await this.afAuth.signOut();
                return {
                    success: false,
                    message: `Esta cuenta es de tipo ${userData.rol}, no ${rolEsperado}`
                };
            }

            // 4. Verificar estado de la cuenta
            if (userData.estado === 'PENDIENTE') {
                await this.afAuth.signOut();
                return {
                    success: false,
                    message: 'Tu cuenta está pendiente de aprobación. Te notificaremos cuando sea aprobada.',
                    user: { ...userData, uid }
                };
            }

            if (userData.estado === 'RECHAZADO') {
                await this.afAuth.signOut();
                return {
                    success: false,
                    message: `Tu solicitud fue rechazada. Motivo: ${userData.motivoRechazo || 'No especificado'}`
                };
            }

            if (userData.estado === 'SUSPENDIDO') {
                await this.afAuth.signOut();
                return {
                    success: false,
                    message: 'Tu cuenta ha sido suspendida. Contacta a soporte.'
                };
            }

            // 5. Actualizar último acceso
            await this.firestore.doc(`users/${uid}`).update({
                ultimoAcceso: new Date()
            });

            return {
                success: true,
                message: '¡Bienvenido!',
                user: { ...userData, uid }
            };

        } catch (error: any) {
            console.error('Error en login:', error);

            let message = 'Error al iniciar sesión';
            if (error.code === 'auth/user-not-found') {
                message = 'No existe una cuenta con este correo electrónico';
            } else if (error.code === 'auth/wrong-password') {
                message = 'Contraseña incorrecta';
            } else if (error.code === 'auth/invalid-email') {
                message = 'Correo electrónico no válido';
            } else if (error.code === 'auth/too-many-requests') {
                message = 'Demasiados intentos fallidos. Intenta más tarde.';
            }

            return { success: false, message };
        }
    }

    // ==================== LOGOUT ====================

    async logout(): Promise<void> {
        try {
            await this.afAuth.signOut();
            this.currentUser$.next(null);
            this.router.navigate(['/auth/login']);
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    }

    // ==================== RECUPERAR CONTRASEÑA ====================

    async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
        try {
            await this.afAuth.sendPasswordResetEmail(email);
            return {
                success: true,
                message: 'Se ha enviado un correo para restablecer tu contraseña'
            };
        } catch (error: any) {
            let message = 'Error al enviar el correo';
            if (error.code === 'auth/user-not-found') {
                message = 'No existe una cuenta con este correo electrónico';
            }
            return { success: false, message };
        }
    }

    // ==================== GETTERS ====================

    getCurrentUser(): Observable<User | null> {
        return this.currentUser$.asObservable();
    }

    getCurrentUserValue(): User | null {
        return this.currentUser$.value;
    }

    isLoading(): Observable<boolean> {
        return this.isLoading$.asObservable();
    }

    isAuthenticated(): boolean {
        return this.currentUser$.value !== null;
    }

    getRole(): string | null {
        return this.currentUser$.value?.rol || null;
    }

    getUserId(): string | null {
        return this.currentUser$.value?.uid || null;
    }

    // ==================== PERFIL ====================

    async updateProfile(updates: Partial<User>): Promise<{ success: boolean; message: string }> {
        try {
            const uid = this.currentUser$.value?.uid;
            if (!uid) {
                return { success: false, message: 'Usuario no autenticado' };
            }

            await this.firestore.doc(`users/${uid}`).update(updates);
            return { success: true, message: 'Perfil actualizado correctamente' };
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            return { success: false, message: 'Error al actualizar el perfil' };
        }
    }

    // ==================== COMPATIBILIDAD CON AUTH.SERVICE ANTERIOR ====================

    // Estos métodos mantienen compatibilidad con el código existente
    get token(): string | null {
        // Firebase maneja tokens internamente, pero retornamos un indicador
        return this.currentUser$.value ? 'firebase-token' : null;
    }

    currentUser(): Observable<any> {
        return this.currentUser$.asObservable().pipe(
            map(user => user ? {
                sub: user.nombreUsuario || user.email,
                email: user.email,
                nombreUsuario: user.nombreUsuario || user.email.split('@')[0],
                role: user.rol
            } : null)
        );
    }

    decodeToken(token: string): any {
        // Firebase maneja tokens internamente
        const user = this.currentUser$.value;
        if (user) {
            return {
                sub: user.nombreUsuario || user.email,
                email: user.email,
                nombreUsuario: user.nombreUsuario || user.email.split('@')[0],
                role: user.rol
            };
        }
        return null;
    }
}
