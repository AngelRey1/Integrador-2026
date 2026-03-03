import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of, combineLatest } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';

export interface Entrenador {
    id?: string;
    userId: string;
    nombre: string;
    apellidoPaterno: string;
    foto: string;
    descripcion: string;
    bio?: string;
    deportes: string[];
    especialidades: string[];
    certificaciones?: string[];
    precio: number;
    precioOnline: number;
    modalidades: string[];
    ubicacion: {
        lat?: number;
        lng?: number;
        direccion?: string;
        ciudad?: string;
    };
    disponibilidad: {
        [dia: string]: Array<{ inicio: string; fin: string }>;
    };
    calificacionPromedio: number;
    totalReviews: number;
    verificado: boolean;
    activo: boolean;
    fechaRegistro: Date;
    telefono?: string;
    whatsapp?: string;
    email?: string;
    direccionEntrenamiento?: string;
}


export interface Reserva {
    id?: string;
    clienteId: string;
    clienteNombre: string;
    entrenadorId: string;
    entrenadorNombre: string;
    claseId?: string;
    fecha: Date;
    hora: string;
    horaFin?: string;
    duracion: number;
    precio: number;
    modalidad: 'presencial' | 'online';
    estado: 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA';
    notas?: string;
    ubicacion?: string;
    motivoCancelacion?: string;
    fechaCreacion: Date;
}

export interface Review {
    id?: string;
    clienteId: string;
    clienteNombre: string;
    clienteFoto?: string;
    entrenadorId: string;
    reservaId: string;
    calificacion: number;
    comentario: string;
    respuestaEntrenador?: string;
    fecha: Date;
}

export interface Pago {
    id?: string;
    reservaId: string;
    clienteId: string;
    entrenadorId: string;
    monto: number;
    comisionPlataforma: number;
    montoEntrenador: number;
    metodo: 'tarjeta' | 'efectivo' | 'transferencia';
    estado: 'PENDIENTE' | 'COMPLETADO' | 'REEMBOLSADO';
    referencia?: string;
    fecha: Date;
}

export interface Deporte {
    id?: string;
    nombre: string;
    icono?: string;
    activo: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ClienteFirebaseService {
    private entrenadoresRef: AngularFirestoreCollection<Entrenador>;
    private reservasRef: AngularFirestoreCollection<Reserva>;
    private reviewsRef: AngularFirestoreCollection<Review>;
    private pagosRef: AngularFirestoreCollection<Pago>;

    constructor(
        private firestore: AngularFirestore,
        private afAuth: AngularFireAuth
    ) {
        this.entrenadoresRef = this.firestore.collection('entrenadores');
        this.reservasRef = this.firestore.collection('reservas');
        this.reviewsRef = this.firestore.collection('reviews');
        this.pagosRef = this.firestore.collection('pagos');
    }

    // ==================== ENTRENADORES ====================

    /**
     * Obtener todos los entrenadores verificados y activos
     */
    getEntrenadores(): Observable<Entrenador[]> {
        return this.firestore.collection<Entrenador>('entrenadores', ref =>
            ref.where('verificado', '==', true)
                .where('activo', '==', true)
        ).valueChanges({ idField: 'id' }).pipe(
            tap(entrenadores => {
                console.log('🔍 Entrenadores encontrados (verificados y activos):', entrenadores.length);
                entrenadores.forEach(e => console.log(`  - ${e.nombre}: verificado=${e.verificado}, activo=${e.activo}`));
            })
        );
    }

    /**
     * Obtener un entrenador público por ID (para perfil público)
     */
    getEntrenadorPublico(id: string): Observable<Entrenador | undefined> {
        return this.firestore.doc<Entrenador>(`entrenadores/${id}`)
            .valueChanges({ idField: 'id' }).pipe(
                map(entrenador => {
                    // Solo devolver si está verificado y activo
                    if (entrenador && entrenador.verificado && entrenador.activo) {
                        return entrenador;
                    }
                    return undefined;
                }),
                catchError(err => {
                    console.error('Error obteniendo entrenador:', err);
                    return of(undefined);
                })
            );
    }

    /**
     * DEBUG: Obtener TODOS los entrenadores sin filtrar (para diagnóstico)
     */
    getAllEntrenadoresDebug(): Observable<Entrenador[]> {
        return this.firestore.collection<Entrenador>('entrenadores')
            .valueChanges({ idField: 'id' }).pipe(
                tap(entrenadores => {
                    console.log('🐛 DEBUG - TODOS los entrenadores en Firestore:');
                    entrenadores.forEach(e => {
                        console.log(`  📋 ${e.nombre} ${e.apellidoPaterno}:`, {
                            id: e.id,
                            verificado: e.verificado,
                            activo: e.activo,
                            deportes: e.deportes,
                            precio: e.precio
                        });
                    });
                })
            );
    }

    /**
     * Buscar entrenadores con filtros
     */
    buscarEntrenadores(filtros?: {
        deporte?: string;
        modalidad?: string;
        precioMax?: number;
        ciudad?: string;
    }): Observable<Entrenador[]> {
        return this.firestore.collection<Entrenador>('entrenadores', ref => {
            let query = ref.where('verificado', '==', true)
                .where('activo', '==', true);

            if (filtros?.deporte) {
                query = query.where('deportes', 'array-contains', filtros.deporte);
            }

            return query;
        }).valueChanges({ idField: 'id' }).pipe(
            map(entrenadores => {
                let resultado = entrenadores;

                // Filtros adicionales en cliente (Firestore tiene limitaciones con múltiples array-contains)
                if (filtros?.modalidad) {
                    resultado = resultado.filter(e => e.modalidades.includes(filtros.modalidad!));
                }
                if (filtros?.precioMax) {
                    resultado = resultado.filter(e => e.precio <= filtros.precioMax!);
                }
                if (filtros?.ciudad) {
                    resultado = resultado.filter(e =>
                        e.ubicacion?.ciudad?.toLowerCase().includes(filtros.ciudad!.toLowerCase())
                    );
                }

                return resultado;
            })
        );
    }

    /**
     * Obtener un entrenador por ID
     */
    getEntrenador(id: string): Observable<Entrenador | undefined> {
        return this.firestore.doc<Entrenador>(`entrenadores/${id}`).valueChanges({ idField: 'id' });
    }

    /**
     * Obtener reviews de un entrenador
     */
    getReviewsEntrenador(entrenadorId: string): Observable<Review[]> {
        return this.firestore.collection<Review>('reviews', ref =>
            ref.where('entrenadorId', '==', entrenadorId)
                .orderBy('fecha', 'desc')
        ).valueChanges({ idField: 'id' });
    }

    // ==================== DEPORTES ====================

    /**
     * Obtener todos los deportes activos desde Firebase
     */
    getDeportes(): Observable<Deporte[]> {
        return this.firestore.collection<Deporte>('deportes', ref =>
            ref.where('activo', '==', true)
        ).valueChanges({ idField: 'id' }).pipe(
            catchError(err => {
                console.error('Error cargando deportes:', err);
                return of([]);
            })
        );
    }

    /**
     * Obtener lista simple de nombres de deportes
     */
    getDeportesNombres(): Observable<string[]> {
        return this.getDeportes().pipe(
            map(deportes => deportes.map(d => d.nombre))
        );
    }

    // ==================== RESERVAS ====================

    /**
     * Obtener mis reservas como cliente
     */
    getMisReservas(): Observable<Reserva[]> {
        return this.afAuth.authState.pipe(
            switchMap(user => {
                if (!user) return of([]);
                return this.firestore.collection<Reserva>('reservas', ref =>
                    ref.where('clienteId', '==', user.uid)
                        .orderBy('fecha', 'desc')
                ).valueChanges({ idField: 'id' });
            })
        );
    }

    /**
     * Obtener reservas próximas
     */
    getReservasProximas(): Observable<Reserva[]> {
        const ahora = new Date();
        return this.afAuth.authState.pipe(
            switchMap(user => {
                if (!user) return of([]);
                return this.firestore.collection<Reserva>('reservas', ref =>
                    ref.where('clienteId', '==', user.uid)
                        .where('fecha', '>=', ahora)
                        .where('estado', 'in', ['PENDIENTE', 'CONFIRMADA'])
                        .orderBy('fecha', 'asc')
                ).valueChanges({ idField: 'id' });
            })
        );
    }

    /**
     * Crear una nueva reserva
     */
    async crearReserva(reserva: Omit<Reserva, 'id' | 'clienteId' | 'fechaCreacion'>): Promise<{ success: boolean; message: string; id?: string }> {
        try {
            const user = await this.afAuth.currentUser;
            if (!user) {
                return { success: false, message: 'Debes iniciar sesión para reservar' };
            }

            // Obtener datos del cliente
            const userDoc = await this.firestore.doc(`users/${user.uid}`).get().toPromise();
            const userData = userDoc?.data() as any;

            // Determinar el nombre del cliente: usar el de la reserva, o buscarlo en userData
            let nombreCliente = reserva.clienteNombre;
            if (!nombreCliente || nombreCliente === 'Cliente') {
                nombreCliente = userData 
                    ? `${userData.nombre || ''} ${userData.apellido || ''}`.trim() || user.displayName || 'Cliente'
                    : user.displayName || 'Cliente';
            }

            const nuevaReserva: Omit<Reserva, 'id'> = {
                ...reserva,
                clienteId: user.uid,
                clienteNombre: nombreCliente,
                // Respetar el estado que viene de la reserva (CONFIRMADA si pagó, PENDIENTE si no)
                estado: reserva.estado || 'PENDIENTE',
                fechaCreacion: new Date()
            };

            const docRef = await this.reservasRef.add(nuevaReserva);

            return {
                success: true,
                message: 'Reserva creada exitosamente',
                id: docRef.id
            };
        } catch (error) {
            console.error('Error al crear reserva:', error);
            return { success: false, message: 'Error al crear la reserva' };
        }
    }

    /**
     * Cancelar una reserva
     */
    async cancelarReserva(reservaId: string, motivo?: string): Promise<{ success: boolean; message: string }> {
        try {
            await this.firestore.doc(`reservas/${reservaId}`).update({
                estado: 'CANCELADA',
                motivoCancelacion: motivo || 'Cancelado por el cliente'
            });
            return { success: true, message: 'Reserva cancelada exitosamente' };
        } catch (error) {
            console.error('Error al cancelar reserva:', error);
            return { success: false, message: 'Error al cancelar la reserva' };
        }
    }

    /**
     * Actualizar el estado de una reserva
     */
    async actualizarEstadoReserva(reservaId: string, nuevoEstado: 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA'): Promise<{ success: boolean; message: string }> {
        try {
            await this.firestore.doc(`reservas/${reservaId}`).update({
                estado: nuevoEstado
            });
            return { success: true, message: `Estado actualizado a ${nuevoEstado}` };
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            return { success: false, message: 'Error al actualizar el estado' };
        }
    }


    /**
     * Obtener horarios ocupados de un entrenador en una fecha
     */
    getHorariosOcupados(entrenadorId: string, fecha: Date): Observable<string[]> {
        const fechaInicio = new Date(fecha);
        fechaInicio.setHours(0, 0, 0, 0);
        const fechaFin = new Date(fecha);
        fechaFin.setHours(23, 59, 59, 999);

        return this.firestore.collection<Reserva>('reservas', ref =>
            ref.where('entrenadorId', '==', entrenadorId)
                .where('fecha', '>=', fechaInicio)
                .where('fecha', '<=', fechaFin)
                .where('estado', 'in', ['PENDIENTE', 'CONFIRMADA'])
        ).valueChanges().pipe(
            map(reservas => reservas.map(r => r.hora))
        );
    }

    // ==================== RESEÑAS ====================

    /**
     * Obtener mis reseñas
     */
    getMisResenas(): Observable<Review[]> {
        return this.afAuth.authState.pipe(
            switchMap(user => {
                if (!user) return of([]);
                return this.firestore.collection<Review>('reviews', ref =>
                    ref.where('clienteId', '==', user.uid)
                        .orderBy('fecha', 'desc')
                ).valueChanges({ idField: 'id' });
            })
        );
    }

    /**
     * Crear una reseña
     */
    async crearResena(review: Omit<Review, 'id' | 'clienteId' | 'clienteNombre' | 'fecha'>): Promise<{ success: boolean; message: string }> {
        try {
            const user = await this.afAuth.currentUser;
            if (!user) {
                return { success: false, message: 'Debes iniciar sesión' };
            }

            const userDoc = await this.firestore.doc(`users/${user.uid}`).get().toPromise();
            const userData = userDoc?.data() as any;

            const nuevaResena: Omit<Review, 'id'> = {
                ...review,
                clienteId: user.uid,
                clienteNombre: userData ? `${userData.nombre} ${userData.apellido}` : 'Cliente',
                clienteFoto: userData?.fotoUrl || '',
                fecha: new Date()
            };

            await this.reviewsRef.add(nuevaResena);

            // Actualizar calificación promedio del entrenador
            await this.actualizarCalificacionEntrenador(review.entrenadorId);

            return { success: true, message: 'Reseña publicada exitosamente' };
        } catch (error) {
            console.error('Error al crear reseña:', error);
            return { success: false, message: 'Error al publicar la reseña' };
        }
    }

    /**
     * Actualizar calificación promedio de un entrenador
     */
    private async actualizarCalificacionEntrenador(entrenadorId: string): Promise<void> {
        const reviewsSnapshot = await this.firestore.collection<Review>('reviews', ref =>
            ref.where('entrenadorId', '==', entrenadorId)
        ).get().toPromise();

        if (reviewsSnapshot && reviewsSnapshot.docs.length > 0) {
            const reviews = reviewsSnapshot.docs.map(d => d.data());
            const promedio = reviews.reduce((sum, r) => sum + r.calificacion, 0) / reviews.length;

            await this.firestore.doc(`entrenadores/${entrenadorId}`).update({
                calificacionPromedio: Math.round(promedio * 10) / 10,
                totalReviews: reviews.length
            });
        }
    }

    // ==================== PAGOS ====================

    /**
     * Obtener mis pagos
     */
    getMisPagos(): Observable<Pago[]> {
        return this.afAuth.authState.pipe(
            switchMap(user => {
                if (!user) return of([]);
                return this.firestore.collection<Pago>('pagos', ref =>
                    ref.where('clienteId', '==', user.uid)
                        .orderBy('fecha', 'desc')
                ).valueChanges({ idField: 'id' });
            })
        );
    }

    // ==================== DASHBOARD ====================

    /**
     * Obtener estadísticas del dashboard del cliente
     */
    getDashboardStats(): Observable<{
        reservasProximas: number;
        reservasCompletadas: number;
        entrenadoresFavoritos: number;
    }> {
        return this.afAuth.authState.pipe(
            switchMap(user => {
                if (!user) return of({ reservasProximas: 0, reservasCompletadas: 0, entrenadoresFavoritos: 0 });

                return this.firestore.collection<Reserva>('reservas', ref =>
                    ref.where('clienteId', '==', user.uid)
                ).valueChanges().pipe(
                    map(reservas => {
                        const ahora = new Date();
                        return {
                            reservasProximas: reservas.filter(r =>
                                new Date(r.fecha) >= ahora &&
                                ['PENDIENTE', 'CONFIRMADA'].includes(r.estado)
                            ).length,
                            reservasCompletadas: reservas.filter(r => r.estado === 'COMPLETADA').length,
                            entrenadoresFavoritos: [...new Set(reservas.map(r => r.entrenadorId))].length
                        };
                    })
                );
            })
        );
    }

    // ==================== PERFIL CLIENTE ====================

    /**
     * Obtener mi perfil de cliente
     */
    getMiPerfil(): Observable<any> {
        return this.afAuth.authState.pipe(
            switchMap(user => {
                if (!user) return of(null);
                return this.firestore.doc(`clientes/${user.uid}`).valueChanges();
            })
        );
    }

    /**
     * Actualizar mi perfil de cliente
     */
    async actualizarMiPerfil(datos: {
        nombre?: string;
        apellidos?: string;
        telefono?: string;
        fechaNacimiento?: Date;
        genero?: string;
        direccion?: {
            calle?: string;
            ciudad?: string;
            codigoPostal?: string;
            pais?: string;
        };
        foto?: string;
        preferencias?: {
            deportesFavoritos?: string[];
            nivelExperiencia?: string;
            objetivos?: string[];
            diasPreferidos?: string[];
            horarioPreferido?: string;
            presupuestoMensual?: number;
        };
        notificaciones?: {
            emailReservas?: boolean;
            emailRecordatorios?: boolean;
            emailPromociones?: boolean;
            smsRecordatorios?: boolean;
            pushNotificaciones?: boolean;
        };
    }): Promise<{ success: boolean; message: string }> {
        try {
            const user = await this.afAuth.currentUser;
            if (!user) {
                return { success: false, message: 'Usuario no autenticado' };
            }

            await this.firestore.doc(`clientes/${user.uid}`).set(
                {
                    ...datos,
                    email: user.email,
                    updatedAt: new Date()
                },
                { merge: true }
            );

            return { success: true, message: 'Perfil actualizado correctamente' };
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            return { success: false, message: 'Error al actualizar el perfil' };
        }
    }

    /**
     * Subir foto de perfil (Base64)
     */
    async actualizarFotoPerfil(fotoBase64: string): Promise<{ success: boolean; message: string }> {
        try {
            const user = await this.afAuth.currentUser;
            if (!user) {
                return { success: false, message: 'Usuario no autenticado' };
            }

            // Validar tamaño (max ~900KB en base64 = ~600KB archivo original)
            if (fotoBase64.length > 900000) {
                return { success: false, message: 'La imagen es demasiado grande. Máximo 600KB.' };
            }

            await this.firestore.doc(`clientes/${user.uid}`).set(
                { foto: fotoBase64, updatedAt: new Date() },
                { merge: true }
            );

            return { success: true, message: 'Foto actualizada correctamente' };
        } catch (error) {
            console.error('Error al actualizar foto:', error);
            return { success: false, message: 'Error al actualizar la foto' };
        }
    }

    /**
     * Cambiar contraseña del usuario
     */
    async cambiarPassword(passwordActual: string, passwordNueva: string): Promise<{ success: boolean; message: string }> {
        try {
            const user = await this.afAuth.currentUser;
            if (!user || !user.email) {
                return { success: false, message: 'Usuario no autenticado' };
            }

            // Importar firebase para reauthenticate
            const firebase = await import('firebase/compat/app');
            const credential = firebase.default.auth.EmailAuthProvider.credential(
                user.email,
                passwordActual
            );

            // Reautenticar antes de cambiar contraseña
            await user.reauthenticateWithCredential(credential);
            
            // Cambiar la contraseña
            await user.updatePassword(passwordNueva);

            return { success: true, message: 'Contraseña actualizada correctamente' };
        } catch (error: any) {
            console.error('Error al cambiar contraseña:', error);
            if (error.code === 'auth/wrong-password') {
                return { success: false, message: 'La contraseña actual es incorrecta' };
            }
            if (error.code === 'auth/weak-password') {
                return { success: false, message: 'La nueva contraseña es muy débil' };
            }
            return { success: false, message: 'Error al cambiar la contraseña' };
        }
    }
}
