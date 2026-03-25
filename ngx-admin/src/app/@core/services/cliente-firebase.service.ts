import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of, combineLatest, forkJoin } from 'rxjs';
import { map, switchMap, catchError, tap, take } from 'rxjs/operators';
import { NotificacionesFirebaseService } from './notificaciones-firebase.service';

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
    experiencia?: number;
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
    planSuscripcion?: string;
    limiteAlumnos?: number;
}


export interface Reserva {
    id?: string;
    clienteId: string;
    clienteNombre: string;
    entrenadorId: string;
    entrenadorNombre: string;
    entrenadorFoto?: string; // ✅ NUEVO: Foto del entrenador desde Firebase
    claseId?: string;
    fecha: Date;
    hora: string;
    horaFin?: string;
    duracion: number;
    precio: number;
    modalidad: 'presencial' | 'online';
    estado: 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA';
    estadoPago?: 'PENDIENTE' | 'COMPLETADO' | 'REEMBOLSADO' | 'NO_REQUERIDO'; // ✅ NUEVO: Seguimiento del pago
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
    entrenadorNombre?: string; // ✅ NUEVO: Nombre del entrenador desde Firebase
    entrenadorFoto?: string;   // ✅ NUEVO: Foto del entrenador desde Firebase
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
    comision: number;
    montoEntrenador: number;
    metodo: 'tarjeta' | 'oxxo' | 'efectivo' | 'transferencia';
    metodoPago?: 'tarjeta' | 'oxxo' | 'efectivo' | 'transferencia';
    estado: 'PENDIENTE' | 'COMPLETADO' | 'REEMBOLSADO';
    referencia?: string;
    fecha: Date;
    // Campos de Stripe para OXXO
    stripePaymentIntentId?: string;
    oxxoReferencia?: string;
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
        private afAuth: AngularFireAuth,
        private notificacionesService: NotificacionesFirebaseService
    ) {
        this.entrenadoresRef = this.firestore.collection('entrenadores');
        this.reservasRef = this.firestore.collection('reservas');
        this.reviewsRef = this.firestore.collection('reviews');
        this.pagosRef = this.firestore.collection('pagos');
    }

    // ==================== ENTRENADORES ====================

    /**
     * Obtener todos los entrenadores verificados y activos (Filtra cupos llenos y expirados)
     */
    getEntrenadores(): Observable<Entrenador[]> {
        return this.firestore.collection<Entrenador>('entrenadores', ref =>
            ref.where('verificado', '==', true)
                .where('activo', '==', true)
        ).valueChanges({ idField: 'id' }).pipe(
            map(entrenadores => {
                const ahora = new Date();
                return entrenadores.filter(e => {
                    const plan = e.planSuscripcion || 'free';
                    if (plan === 'free') {
                        const fechaReg = e.fechaRegistro instanceof Date ? e.fechaRegistro : new Date((e.fechaRegistro as any)?.seconds * 1000);
                        if (!fechaReg) return true; // prevent breaking if missing
                        const diffDays = (ahora.getTime() - fechaReg.getTime()) / (1000 * 3600 * 24);
                        if (diffDays > 15) return false; // Trial expired
                    }
                    return true;
                });
            }),
            switchMap(entrenadores => {
                // Verificar que no hayan alcanzado su límite de alumnos
                if (entrenadores.length === 0) return of([]);
                
                const observables = entrenadores.map(e => {
                    const limite = e.limiteAlumnos || 5;
                    if (limite >= 999999) return of(e); // Plan ilimitado
                    
                    // Cuenta los alumnos únicos
                    return this.firestore.collection('reservas', ref => ref.where('entrenadorId', '==', e.id))
                        .get().pipe(
                            map(snapshot => {
                                const uniqueClients = new Set();
                                snapshot.docs.forEach(doc => {
                                    const data = doc.data() as any;
                                    uniqueClients.add(data.clienteId);
                                });
                                // Si alcanzó su límite, lo ocultamos
                                if (uniqueClients.size >= limite) return null;
                                return e;
                            }),
                            catchError(() => of(e)) // en fallo, lo mostramos
                        );
                });
                
                return forkJoin(observables).pipe(
                    map(results => results.filter(r => r !== null) as Entrenador[])
                );
            }),
            tap(entrenadores => {
                console.log('🔍 Entrenadores encontrados (verificados, activos, con cupo y trial válido):', entrenadores.length);
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
                        const plan = entrenador.planSuscripcion || 'free';
                        if (plan === 'free') {
                            const ahora = new Date();
                            const fechaReg = entrenador.fechaRegistro instanceof Date ? entrenador.fechaRegistro : new Date((entrenador.fechaRegistro as any)?.seconds * 1000);
                            if (fechaReg) {
                                const diffDays = (ahora.getTime() - fechaReg.getTime()) / (1000 * 3600 * 24);
                                if (diffDays > 15) return undefined; // Trial expired, prevent direct access
                            }
                        }
                        return entrenador;
                    }
                    return undefined;
                }),
                switchMap(entrenador => {
                    if (!entrenador) return of(undefined);
                    
                    const limite = entrenador.limiteAlumnos || 5;
                    if (limite >= 999999) return of(entrenador);
                    
                    return this.firestore.collection('reservas', ref => ref.where('entrenadorId', '==', entrenador.id))
                        .get().pipe(
                            map(snapshot => {
                                const uniqueClients = new Set();
                                snapshot.docs.forEach(doc => uniqueClients.add((doc.data() as any).clienteId));
                                // Aquí podríamos no ocultarlo pero marcarlo como lleno.
                                // Por simplicidad y UX, para accesos directos por ID no lo ocultaremos completamente.
                                // O podemos ponerle un field temporal `estaLleno` para deshabilitar reservas.
                                (entrenador as any).estaLleno = uniqueClients.size >= limite;
                                return entrenador;
                            })
                        );
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
                ).valueChanges({ idField: 'id' }).pipe(
                    switchMap(reservas => {
                        // Enriquecer cada reserva con datos del entrenador
                        if (reservas.length === 0) return of([]);
                        
                        const reservasEnriquecidas = reservas.map(r => 
                            this.firestore.doc<Entrenador>(`entrenadores/${r.entrenadorId}`)
                                .valueChanges()
                                .pipe(
                                    map(entrenador => ({
                                        ...r,
                                        entrenadorFoto: entrenador?.foto // ✅ DATOS REALES desde Firebase
                                    }))
                                )
                        );
                        
                        return reservasEnriquecidas.length > 0 
                            ? forkJoin(reservasEnriquecidas)
                            : of([]);
                    })
                );
            })
        );
    }

    /**
     * Obtener mis reservas sin ordenar (para filtros simples)
     */
    getMisReservasSinOrden(): Observable<Reserva[]> {
        return this.afAuth.authState.pipe(
            switchMap(user => {
                if (!user) return of([]);
                return this.firestore.collection<Reserva>('reservas', ref =>
                    ref.where('clienteId', '==', user.uid)
                ).valueChanges({ idField: 'id' }).pipe(
                    switchMap(reservas => {
                        // Enriquecer cada reserva con datos del entrenador
                        if (reservas.length === 0) return of([]);
                        
                        const reservasEnriquecidas = reservas.map(r => 
                            this.firestore.doc<Entrenador>(`entrenadores/${r.entrenadorId}`)
                                .valueChanges()
                                .pipe(
                                    map(entrenador => ({
                                        ...r,
                                        entrenadorFoto: entrenador?.foto // ✅ DATOS REALES desde Firebase
                                    }))
                                )
                        );
                        
                        return reservasEnriquecidas.length > 0 
                            ? forkJoin(reservasEnriquecidas)
                            : of([]);
                    })
                );
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
                ).valueChanges({ idField: 'id' }).pipe(
                    switchMap(reservas => {
                        // Enriquecer cada reserva con datos del entrenador
                        if (reservas.length === 0) return of([]);
                        
                        const reservasEnriquecidas = reservas.map(r => 
                            this.firestore.doc<Entrenador>(`entrenadores/${r.entrenadorId}`)
                                .valueChanges()
                                .pipe(
                                    map(entrenador => ({
                                        ...r,
                                        entrenadorFoto: entrenador?.foto, // ✅ DATOS REALES desde Firebase
                                        entrenadorNombre: entrenador?.nombre || r.entrenadorNombre || 'Entrenador'
                                    }))
                                )
                        );
                        
                        return reservasEnriquecidas.length > 0 
                            ? forkJoin(reservasEnriquecidas)
                            : of([]);
                    })
                );
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

            try {
                // Enviar la notificación silenciosamente en segundo plano
                const fechaFormateada = reserva.fecha instanceof Date
                    ? reserva.fecha.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
                    : new Date(reserva.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
                
                await this.notificacionesService.notificarNuevaReserva(
                    reserva.entrenadorId,
                    nombreCliente,
                    fechaFormateada
                );
                console.log('✅ Notificación de nueva reserva enviada al entrenador');
            } catch (err) {
                console.error('⚠️ Error enviando notificación de reserva:', err);
                // No rompemos el flujo principal por un error de notificación
            }

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
   * Obtener horarios ocupados de un entrenador en una fecha y cruzarlos con su configuración real
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

  /**
   * Cargar métodos de pago vinculados al usuario
   */
  getMetodosPago(): Observable<any[]> {
    return this.afAuth.authState.pipe(
      take(1),
      switchMap(user => {
        if (!user) return of([]);
        return this.firestore.collection(`users/${user.uid}/paymentMethods`).valueChanges({ idField: 'id' }).pipe(
            map(methods => methods.length ? methods : [
                { id: 'card_demo', tipo: 'Tarjeta Integrada', ultimos_digitos: '4242', icono: 'credit-card-outline' }
            ])
        );
      })
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
                ).valueChanges({ idField: 'id' }).pipe(
                    switchMap(reviews => {
                        // Enriquecer cada reseña con datos del entrenador
                        if (reviews.length === 0) return of([]);
                        
                        const resennasEnriquecidas = reviews.map(r => 
                            this.firestore.doc<Entrenador>(`entrenadores/${r.entrenadorId}`)
                                .valueChanges()
                                .pipe(
                                    map(entrenador => ({
                                        ...r,
                                        entrenadorNombre: entrenador?.nombre || 'Entrenador',
                                        entrenadorFoto: entrenador?.foto // ✅ DATOS REALES desde Firebase
                                    }))
                                )
                        );
                        
                        return resennasEnriquecidas.length > 0 
                            ? forkJoin(resennasEnriquecidas)
                            : of([]);
                    })
                );
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
     * Eliminar una reseña
     */
    async eliminarResena(resenaId: string, entrenadorId: string): Promise<{ success: boolean; message: string }> {
        try {
            const user = await this.afAuth.currentUser;
            if (!user) {
                return { success: false, message: 'Debes iniciar sesión' };
            }

            // Verificar que la reseña pertenece al usuario actual
            const resenaDoc = await this.firestore.doc(`reviews/${resenaId}`).get().toPromise();
            const resena = resenaDoc?.data() as any;

            if (!resena) {
                return { success: false, message: 'Reseña no encontrada' };
            }

            if (resena.clienteId !== user.uid) {
                return { success: false, message: 'No puedes eliminar reseñas de otros usuarios' };
            }

            // Eliminar la reseña
            await this.firestore.doc(`reviews/${resenaId}`).delete();

            // Actualizar calificación promedio del entrenador
            await this.actualizarCalificacionEntrenador(entrenadorId);

            return { success: true, message: 'Reseña eliminada correctamente' };
        } catch (error) {
            console.error('Error al eliminar reseña:', error);
            return { success: false, message: 'Error al eliminar la reseña' };
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

    /**
     * Crear un registro de pago (para OXXO y otros métodos)
     */
    async crearPago(pagoData: {
        reservaId: string;
        entrenadorId: string;
        monto: number;
        metodo: 'tarjeta' | 'oxxo' | 'efectivo' | 'transferencia';
        stripePaymentIntentId?: string;
        oxxoReferencia?: string;
    }): Promise<{ success: boolean; message: string; id?: string }> {
        try {
            const user = await this.afAuth.currentUser;
            if (!user) {
                return { success: false, message: 'Usuario no autenticado' };
            }

            // Calcular comisión (10%) y monto del entrenador
            const comision = pagoData.monto * 0.10;
            const montoEntrenador = pagoData.monto - comision;

            const nuevoPago: Omit<Pago, 'id'> = {
                reservaId: pagoData.reservaId,
                clienteId: user.uid,
                entrenadorId: pagoData.entrenadorId,
                monto: pagoData.monto,
                comision: comision,
                montoEntrenador: montoEntrenador,
                metodo: pagoData.metodo,
                metodoPago: pagoData.metodo, // campo esperado por el panel admin
                estado: pagoData.metodo === 'oxxo' ? 'PENDIENTE' : 'COMPLETADO',
                fecha: new Date(),
                stripePaymentIntentId: pagoData.stripePaymentIntentId,
                oxxoReferencia: pagoData.oxxoReferencia
            };

            const docRef = await this.pagosRef.add(nuevoPago);
            console.log('✅ Pago creado:', docRef.id);

            return {
                success: true,
                message: 'Pago registrado exitosamente',
                id: docRef.id
            };
        } catch (error) {
            console.error('Error al crear pago:', error);
            return { success: false, message: 'Error al registrar el pago' };
        }
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

    // ==================== LOGROS ====================

    /**
     * Calcular logros desbloqueados del usuario basados en sus reservas completadas
     * 
     * Logros disponibles:
     * - Primera Sesión: 1+ sesiones completadas
     * - Racha de Disciplina: 5+ sesiones completadas
     * - Explorador: 3+ deportes diferentes
     * - Campeón: 10+ sesiones completadas
     * - Madrugador: Sesión completada antes de las 7am
     */
    getLogrosDesbloqueados(): Observable<any[]> {
        return this.getMisReservas().pipe(
            map(reservas => {
                const logros: any[] = [];
                
                // Filtrar solo las completadas
                const completadas = reservas.filter(r => r.estado === 'COMPLETADA');
                
                console.log(`📊 Total sesiones completadas: ${completadas.length}`);

                // LOGRO 1: Primera sesión completada
                if (completadas.length >= 1) {
                    logros.push({
                        id: 'logro_primera_sesion',
                        nombre: 'Primera Sesión',
                        tipo: 'bronce',
                        icono: 'award',
                        descripcion: 'Completaste tu primera sesión de entrenamiento',
                        fechaDesbloqueado: completadas[0].fecha
                    });
                    console.log('✅ DESBLOQUEADO: Primera Sesión');
                }

                // LOGRO 2: Racha de disciplina (5 sesiones)
                if (completadas.length >= 5) {
                    logros.push({
                        id: 'logro_racha_5',
                        nombre: 'Racha de Disciplina',
                        tipo: 'plata',
                        icono: 'fire',
                        descripcion: 'Completaste 5 sesiones de entrenamiento',
                        progreso: {
                            actual: completadas.length,
                            requerido: 5
                        }
                    });
                    console.log('✅ DESBLOQUEADO: Racha de Disciplina');
                }

                // LOGRO 3: Explorador (3+ deportes distintos)
                const deportesUnicos = new Set(
                    completadas
                        .map((r: any) => r.deporte || r.entrenadorId)
                        .filter(Boolean)
                );

                if (deportesUnicos.size >= 3) {
                    logros.push({
                        id: 'logro_explorador',
                        nombre: 'Explorador',
                        tipo: 'oro',
                        icono: 'globe',
                        descripcion: `Entrenaste en ${deportesUnicos.size} deportes diferentes`,
                        deportes: Array.from(deportesUnicos),
                        progreso: {
                            actual: deportesUnicos.size,
                            requerido: 3
                        }
                    });
                    console.log(`✅ DESBLOQUEADO: Explorador (${deportesUnicos.size} deportes)`);
                }

                // LOGRO 4: Campeón (10+ sesiones)
                if (completadas.length >= 10) {
                    logros.push({
                        id: 'logro_campeon',
                        nombre: 'Campeón',
                        tipo: 'platino',
                        icono: 'star',
                        descripcion: 'Completaste 10+ sesiones de entrenamiento',
                        progreso: {
                            actual: completadas.length,
                            requerido: 10
                        }
                    });
                    console.log('✅ DESBLOQUEADO: Campeón');
                }

                // LOGRO 5: Madrugador (sesión antes de 7am)
                const madrugadas = completadas.filter(r => {
                    const hora = new Date(r.fecha).getHours();
                    return hora < 7;
                });
                if (madrugadas.length >= 1) {
                    logros.push({
                        id: 'logro_madrugador',
                        nombre: 'Madrugador',
                        tipo: 'plata',
                        icono: 'moon',
                        descripcion: 'Completaste una sesión antes de las 7am',
                        progreso: {
                            actual: madrugadas.length,
                            requerido: 1
                        }
                    });
                    console.log('✅ DESBLOQUEADO: Madrugador');
                }

                console.log(`🏆 Total logros desbloqueados: ${logros.length}`);
                return logros;
            }),
            catchError(err => {
                console.error('❌ Error calculando logros:', err);
                return of([]);
            })
        );
    }
}
