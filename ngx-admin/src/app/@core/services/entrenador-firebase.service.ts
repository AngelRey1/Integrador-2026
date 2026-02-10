import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of, combineLatest } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Entrenador, Reserva, Review, Pago } from './cliente-firebase.service';

export interface Clase {
    id?: string;
    entrenadorId: string;
    nombre: string;
    descripcion: string;
    deporte: string;
    precio: number;
    duracion: number;
    capacidad: number;
    modalidad: 'presencial' | 'online' | 'ambos';
    activa: boolean;
    fechaCreacion?: Date;
}

export interface ClienteResumen {
    clienteId: string;
    nombre: string;
    foto?: string;
    sesiones: number;
    ultimaSesion?: Date;
}

export interface EstadisticasMensuales {
    mes: string;
    sesiones: number;
    ingresos: number;
}

@Injectable({
    providedIn: 'root'
})
export class EntrenadorFirebaseService {

    constructor(
        private firestore: AngularFirestore,
        private afAuth: AngularFireAuth
    ) { }

    // ==================== PERFIL ENTRENADOR ====================

    /**
     * Obtener mi perfil de entrenador
     */
    getMiPerfil(): Observable<Entrenador | null> {
        return this.afAuth.authState.pipe(
            switchMap(user => {
                if (!user) return of(null);
                return this.firestore.doc<Entrenador>(`entrenadores/${user.uid}`)
                    .valueChanges({ idField: 'id' });
            })
        );
    }

    /**
     * Actualizar mi perfil de entrenador
     */
    async actualizarPerfil(datos: Partial<Entrenador>): Promise<{ success: boolean; message: string }> {
        try {
            const user = await this.afAuth.currentUser;
            if (!user) {
                return { success: false, message: 'No autenticado' };
            }

            await this.firestore.doc(`entrenadores/${user.uid}`).update(datos);
            return { success: true, message: 'Perfil actualizado correctamente' };
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            return { success: false, message: 'Error al actualizar el perfil' };
        }
    }

    /**
     * Actualizar foto de perfil usando URL externa
     * (No usa Storage - el usuario proporciona la URL de la imagen)
     */
    async actualizarFotoPerfil(url: string): Promise<{ success: boolean; message: string }> {
        try {
            const user = await this.afAuth.currentUser;
            if (!user) {
                return { success: false, message: 'No autenticado' };
            }

            // Actualizar en entrenadores y users
            await this.firestore.doc(`entrenadores/${user.uid}`).update({ foto: url });
            await this.firestore.doc(`users/${user.uid}`).update({ fotoUrl: url });

            return { success: true, message: 'Foto actualizada' };
        } catch (error) {
            console.error('Error al actualizar foto:', error);
            return { success: false, message: 'Error al actualizar la foto' };
        }
    }

    // ==================== DISPONIBILIDAD ====================

    /**
     * Obtener disponibilidad actual
     */
    getDisponibilidad(): Observable<{ [dia: string]: Array<{ inicio: string; fin: string }> } | null> {
        return this.getMiPerfil().pipe(
            map(perfil => perfil?.disponibilidad || null)
        );
    }

    /**
     * Actualizar disponibilidad
     */
    async actualizarDisponibilidad(
        disponibilidad: { [dia: string]: Array<{ inicio: string; fin: string }> }
    ): Promise<{ success: boolean; message: string }> {
        try {
            const user = await this.afAuth.currentUser;
            if (!user) {
                return { success: false, message: 'No autenticado' };
            }

            await this.firestore.doc(`entrenadores/${user.uid}`).update({ disponibilidad });
            return { success: true, message: 'Disponibilidad actualizada' };
        } catch (error) {
            console.error('Error:', error);
            return { success: false, message: 'Error al actualizar disponibilidad' };
        }
    }

    // ==================== RESERVAS ====================

    /**
     * Obtener mis reservas como entrenador
     */
    getMisReservas(estado?: string): Observable<Reserva[]> {
        return this.afAuth.authState.pipe(
            switchMap(user => {
                if (!user) return of([]);

                let query = this.firestore.collection<Reserva>('reservas', ref => {
                    let q = ref.where('entrenadorId', '==', user.uid)
                        .orderBy('fecha', 'desc');
                    return q;
                });

                return query.valueChanges({ idField: 'id' }).pipe(
                    map(reservas => {
                        if (estado) {
                            return reservas.filter(r => r.estado === estado);
                        }
                        return reservas;
                    })
                );
            })
        );
    }

    /**
     * Obtener sesiones de hoy
     */
    getSesionesHoy(): Observable<Reserva[]> {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);

        return this.afAuth.authState.pipe(
            switchMap(user => {
                if (!user) return of([]);
                return this.firestore.collection<Reserva>('reservas', ref =>
                    ref.where('entrenadorId', '==', user.uid)
                        .where('fecha', '>=', hoy)
                        .where('fecha', '<', manana)
                        .where('estado', 'in', ['PENDIENTE', 'CONFIRMADA'])
                ).valueChanges({ idField: 'id' });
            })
        );
    }

    /**
     * Obtener próximas sesiones
     */
    getProximasSesiones(limite: number = 10): Observable<Reserva[]> {
        const ahora = new Date();

        return this.afAuth.authState.pipe(
            switchMap(user => {
                if (!user) return of([]);
                return this.firestore.collection<Reserva>('reservas', ref =>
                    ref.where('entrenadorId', '==', user.uid)
                        .where('fecha', '>=', ahora)
                        .where('estado', 'in', ['PENDIENTE', 'CONFIRMADA'])
                        .orderBy('fecha', 'asc')
                        .limit(limite)
                ).valueChanges({ idField: 'id' });
            })
        );
    }

    /**
     * Confirmar una reserva
     */
    async confirmarReserva(reservaId: string): Promise<{ success: boolean; message: string }> {
        try {
            await this.firestore.doc(`reservas/${reservaId}`).update({
                estado: 'CONFIRMADA'
            });
            return { success: true, message: 'Reserva confirmada' };
        } catch (error) {
            console.error('Error:', error);
            return { success: false, message: 'Error al confirmar la reserva' };
        }
    }

    /**
     * Completar una reserva
     */
    async completarReserva(reservaId: string): Promise<{ success: boolean; message: string }> {
        try {
            await this.firestore.doc(`reservas/${reservaId}`).update({
                estado: 'COMPLETADA'
            });
            return { success: true, message: 'Sesión marcada como completada' };
        } catch (error) {
            console.error('Error:', error);
            return { success: false, message: 'Error al completar la reserva' };
        }
    }

    /**
     * Cancelar una reserva
     */
    async cancelarReserva(reservaId: string, motivo: string): Promise<{ success: boolean; message: string }> {
        try {
            await this.firestore.doc(`reservas/${reservaId}`).update({
                estado: 'CANCELADA',
                motivoCancelacion: motivo
            });
            return { success: true, message: 'Reserva cancelada' };
        } catch (error) {
            console.error('Error:', error);
            return { success: false, message: 'Error al cancelar la reserva' };
        }
    }

    // ==================== CLASES ====================

    /**
     * Obtener mis clases
     */
    getMisClases(): Observable<Clase[]> {
        return this.afAuth.authState.pipe(
            switchMap(user => {
                if (!user) return of([]);
                return this.firestore.collection<Clase>('clases', ref =>
                    ref.where('entrenadorId', '==', user.uid)
                ).valueChanges({ idField: 'id' });
            })
        );
    }

    /**
     * Crear una nueva clase
     */
    async crearClase(clase: Omit<Clase, 'id' | 'entrenadorId'>): Promise<{ success: boolean; message: string }> {
        try {
            const user = await this.afAuth.currentUser;
            if (!user) {
                return { success: false, message: 'No autenticado' };
            }

            await this.firestore.collection('clases').add({
                ...clase,
                entrenadorId: user.uid,
                fechaCreacion: new Date()
            });

            return { success: true, message: 'Clase creada exitosamente' };
        } catch (error) {
            console.error('Error:', error);
            return { success: false, message: 'Error al crear la clase' };
        }
    }

    /**
     * Actualizar una clase
     */
    async actualizarClase(claseId: string, datos: Partial<Clase>): Promise<{ success: boolean; message: string }> {
        try {
            await this.firestore.doc(`clases/${claseId}`).update(datos);
            return { success: true, message: 'Clase actualizada' };
        } catch (error) {
            console.error('Error:', error);
            return { success: false, message: 'Error al actualizar la clase' };
        }
    }

    /**
     * Eliminar una clase
     */
    async eliminarClase(claseId: string): Promise<{ success: boolean; message: string }> {
        try {
            await this.firestore.doc(`clases/${claseId}`).delete();
            return { success: true, message: 'Clase eliminada' };
        } catch (error) {
            console.error('Error:', error);
            return { success: false, message: 'Error al eliminar la clase' };
        }
    }

    // ==================== CLIENTES ====================

    /**
     * Obtener mis clientes (usuarios que han tomado sesiones conmigo)
     */
    getMisClientes(): Observable<ClienteResumen[]> {
        return this.afAuth.authState.pipe(
            switchMap(user => {
                if (!user) return of([]);
                return this.firestore.collection<Reserva>('reservas', ref =>
                    ref.where('entrenadorId', '==', user.uid)
                        .where('estado', '==', 'COMPLETADA')
                ).valueChanges().pipe(
                    map(reservas => {
                        const clientesMap = new Map<string, ClienteResumen>();

                        reservas.forEach(r => {
                            if (clientesMap.has(r.clienteId)) {
                                const cliente = clientesMap.get(r.clienteId)!;
                                cliente.sesiones++;
                                if (!cliente.ultimaSesion || new Date(r.fecha) > cliente.ultimaSesion) {
                                    cliente.ultimaSesion = new Date(r.fecha);
                                }
                            } else {
                                clientesMap.set(r.clienteId, {
                                    clienteId: r.clienteId,
                                    nombre: r.clienteNombre,
                                    sesiones: 1,
                                    ultimaSesion: new Date(r.fecha)
                                });
                            }
                        });

                        return Array.from(clientesMap.values())
                            .sort((a, b) => b.sesiones - a.sesiones);
                    })
                );
            })
        );
    }

    // ==================== INGRESOS ====================

    /**
     * Obtener mis ingresos
     */
    getMisIngresos(periodo?: { desde: Date; hasta: Date }): Observable<Pago[]> {
        return this.afAuth.authState.pipe(
            switchMap(user => {
                if (!user) return of([]);

                let query = this.firestore.collection<Pago>('pagos', ref => {
                    let q = ref.where('entrenadorId', '==', user.uid)
                        .where('estado', '==', 'COMPLETADO');

                    if (periodo) {
                        q = q.where('fecha', '>=', periodo.desde)
                            .where('fecha', '<=', periodo.hasta);
                    }

                    return q.orderBy('fecha', 'desc');
                });

                return query.valueChanges({ idField: 'id' });
            })
        );
    }

    /**
     * Obtener resumen de ingresos
     */
    getResumenIngresos(): Observable<{
        ingresosMes: number;
        ingresosSemanales: number;
        totalHistorico: number;
    }> {
        return this.getMisIngresos().pipe(
            map(pagos => {
                const ahora = new Date();
                const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
                const inicioSemana = new Date(ahora);
                inicioSemana.setDate(ahora.getDate() - ahora.getDay());

                return {
                    ingresosMes: pagos
                        .filter(p => new Date(p.fecha) >= inicioMes)
                        .reduce((sum, p) => sum + p.montoEntrenador, 0),
                    ingresosSemanales: pagos
                        .filter(p => new Date(p.fecha) >= inicioSemana)
                        .reduce((sum, p) => sum + p.montoEntrenador, 0),
                    totalHistorico: pagos.reduce((sum, p) => sum + p.montoEntrenador, 0)
                };
            })
        );
    }

    // ==================== ESTADÍSTICAS DASHBOARD ====================

    /**
     * Obtener estadísticas del dashboard con comparaciones al mes anterior
     */
    getDashboardStats(): Observable<{
        clientesActivos: number;
        clientesNuevosMes: number;
        clientesMesAnterior: number;
        sesionesMes: number;
        sesionesMesAnterior: number;
        ingresosMes: number;
        ingresosMesAnterior: number;
        calificacion: number;
        totalResenas: number;
        tasaAsistencia: number;
    }> {
        return this.afAuth.authState.pipe(
            switchMap(user => {
                if (!user) return of({
                    clientesActivos: 0,
                    clientesNuevosMes: 0,
                    clientesMesAnterior: 0,
                    sesionesMes: 0,
                    sesionesMesAnterior: 0,
                    ingresosMes: 0,
                    ingresosMesAnterior: 0,
                    calificacion: 0,
                    totalResenas: 0,
                    tasaAsistencia: 0
                });

                const ahora = new Date();
                const inicioMesActual = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
                const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
                const finMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0); // Último día del mes anterior

                return combineLatest([
                    this.getMisClientes(),
                    this.getMisReservas(),
                    this.getMisIngresos(),
                    this.getMiPerfil()
                ]).pipe(
                    map(([clientes, reservas, pagos, perfil]) => {
                        // Reservas este mes
                        const reservasMesActual = reservas.filter(r => {
                            const fecha = this.toDate(r.fecha);
                            return fecha >= inicioMesActual && fecha <= ahora;
                        });

                        // Reservas mes anterior
                        const reservasMesAnterior = reservas.filter(r => {
                            const fecha = this.toDate(r.fecha);
                            return fecha >= inicioMesAnterior && fecha <= finMesAnterior;
                        });

                        // Clientes nuevos este mes (primera sesión completada este mes)
                        const clientesPrimeraSesion = new Map<string, Date>();
                        reservas.filter(r => r.estado === 'COMPLETADA').forEach(r => {
                            const fecha = this.toDate(r.fecha);
                            const existente = clientesPrimeraSesion.get(r.clienteId);
                            if (!existente || fecha < existente) {
                                clientesPrimeraSesion.set(r.clienteId, fecha);
                            }
                        });

                        const clientesNuevosMes = Array.from(clientesPrimeraSesion.values())
                            .filter(fecha => fecha >= inicioMesActual).length;

                        const clientesMesAnterior = Array.from(clientesPrimeraSesion.values())
                            .filter(fecha => fecha >= inicioMesAnterior && fecha <= finMesAnterior).length;

                        // Sesiones activas (completadas, confirmadas, pendientes)
                        const sesionesMes = reservasMesActual.filter(r =>
                            ['COMPLETADA', 'CONFIRMADA', 'PENDIENTE'].includes(r.estado)
                        ).length;

                        const sesionesMesAnterior = reservasMesAnterior.filter(r =>
                            ['COMPLETADA', 'CONFIRMADA', 'PENDIENTE'].includes(r.estado)
                        ).length;

                        // Ingresos
                        const ingresosMes = pagos
                            .filter(p => {
                                const fecha = this.toDate(p.fecha);
                                return fecha >= inicioMesActual && fecha <= ahora;
                            })
                            .reduce((sum, p) => sum + (p.montoEntrenador || 0), 0);

                        const ingresosMesAnterior = pagos
                            .filter(p => {
                                const fecha = this.toDate(p.fecha);
                                return fecha >= inicioMesAnterior && fecha <= finMesAnterior;
                            })
                            .reduce((sum, p) => sum + (p.montoEntrenador || 0), 0);

                        // Tasa de asistencia
                        const completadas = reservasMesActual.filter(r => r.estado === 'COMPLETADA').length;
                        const total = reservasMesActual.filter(r => ['COMPLETADA', 'CANCELADA'].includes(r.estado)).length;

                        return {
                            clientesActivos: clientes.length,
                            clientesNuevosMes,
                            clientesMesAnterior,
                            sesionesMes,
                            sesionesMesAnterior,
                            ingresosMes,
                            ingresosMesAnterior,
                            calificacion: perfil?.calificacionPromedio || 0,
                            totalResenas: perfil?.totalReviews || 0,
                            tasaAsistencia: total > 0 ? Math.round((completadas / total) * 100) : 100
                        };
                    })
                );
            })
        );
    }

    /**
     * Convertir fecha de Firestore a Date
     */
    private toDate(fecha: any): Date {
        if (fecha instanceof Date) return fecha;
        if (fecha?.seconds) return new Date(fecha.seconds * 1000);
        if (fecha?.toDate) return fecha.toDate();
        return new Date(fecha);
    }

    /**
     * Obtener estadísticas mensuales para gráficos
     */
    getEstadisticasMensuales(meses: number = 4): Observable<EstadisticasMensuales[]> {
        return this.afAuth.authState.pipe(
            switchMap(user => {
                if (!user) return of([]);

                const ahora = new Date();
                const fechaInicio = new Date(ahora);
                fechaInicio.setMonth(ahora.getMonth() - meses + 1);
                fechaInicio.setDate(1);

                return combineLatest([
                    this.getMisReservas(),
                    this.getMisIngresos({ desde: fechaInicio, hasta: ahora })
                ]).pipe(
                    map(([reservas, pagos]) => {
                        const estadisticas: EstadisticasMensuales[] = [];
                        const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

                        for (let i = meses - 1; i >= 0; i--) {
                            const fecha = new Date(ahora);
                            fecha.setMonth(ahora.getMonth() - i);
                            const mes = fecha.getMonth();
                            const año = fecha.getFullYear();

                            const sesiones = reservas.filter(r => {
                                const fechaR = new Date(r.fecha);
                                return fechaR.getMonth() === mes &&
                                    fechaR.getFullYear() === año &&
                                    r.estado === 'COMPLETADA';
                            }).length;

                            const ingresos = pagos.filter(p => {
                                const fechaP = new Date(p.fecha);
                                return fechaP.getMonth() === mes && fechaP.getFullYear() === año;
                            }).reduce((sum, p) => sum + p.montoEntrenador, 0);

                            estadisticas.push({
                                mes: nombresMeses[mes],
                                sesiones,
                                ingresos
                            });
                        }

                        return estadisticas;
                    })
                );
            })
        );
    }

    // ==================== REVIEWS ====================

    /**
     * Obtener mis reviews (como entrenador)
     */
    getMisReviews(): Observable<Review[]> {
        return this.afAuth.authState.pipe(
            switchMap(user => {
                if (!user) return of([]);
                return this.firestore.collection<Review>('reviews', ref =>
                    ref.where('entrenadorId', '==', user.uid)
                        .orderBy('fecha', 'desc')
                ).valueChanges({ idField: 'id' });
            })
        );
    }

    /**
     * Responder a una review
     */
    async responderReview(reviewId: string, respuesta: string): Promise<{ success: boolean; message: string }> {
        try {
            await this.firestore.doc(`reviews/${reviewId}`).update({
                respuestaEntrenador: respuesta
            });
            return { success: true, message: 'Respuesta publicada' };
        } catch (error) {
            console.error('Error:', error);
            return { success: false, message: 'Error al publicar respuesta' };
        }
    }
}
