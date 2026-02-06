import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of, combineLatest } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

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
        ).valueChanges({ idField: 'id' });
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

            const nuevaReserva: Omit<Reserva, 'id'> = {
                ...reserva,
                clienteId: user.uid,
                clienteNombre: userData ? `${userData.nombre} ${userData.apellido}` : 'Cliente',
                estado: 'PENDIENTE',
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
}
