import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

// Interfaces para Admin
export interface Usuario {
    id?: string;
    email: string;
    nombre: string;
    apellidoPaterno: string;
    tipo: 'cliente' | 'entrenador' | 'admin';
    activo: boolean;
    fechaRegistro: Date;
    fotoUrl?: string;
}

export interface DocumentoVerificacion {
    nombre: string;
    tipo: string;
    base64: string;
    tamano: number;
}

export interface DocumentosEntrenador {
    ine: DocumentoVerificacion | null;
    certificacion: DocumentoVerificacion | null;
    fechaSubida: Date;
    estadoVerificacion: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
    motivoRechazo?: string;
}

export interface Entrenador {
    id?: string;
    userId: string;
    nombre: string;
    apellidoPaterno: string;
    email?: string;
    foto?: string;
    deportes: string[];
    precio: number;
    calificacionPromedio: number;
    totalReviews: number;
    verificado: boolean;
    activo: boolean;
    fechaRegistro: Date;
    direccionEntrenamiento?: string;
    documentos?: DocumentosEntrenador;
}

export interface Reserva {
    id?: string;
    clienteId: string;
    clienteNombre: string;
    entrenadorId: string;
    entrenadorNombre: string;
    fecha: Date;
    precio: number;
    estado: 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA';
}

export interface Pago {
    id?: string;
    reservaId: string;
    clienteId: string;
    entrenadorId: string;
    monto: number;
    montoEntrenador: number;
    comision: number;
    estado: 'PENDIENTE' | 'COMPLETADO' | 'REEMBOLSADO';
    fecha: Date;
}

export interface Deporte {
    id?: string;
    nombre: string;
    icono: string;
    activo: boolean;
}

export interface DashboardStats {
    totalUsuarios: number;
    totalEntrenadores: number;
    totalReservas: number;
    ingresosMes: number;
    reservasHoy: number;
    reservasSemana: number;
}

@Injectable({
    providedIn: 'root'
})
export class AdminFirebaseService {

    constructor(
        private firestore: AngularFirestore,
        private afAuth: AngularFireAuth
    ) { }

    // ==================== DASHBOARD ====================

    getDashboardStats(): Observable<DashboardStats> {
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const inicioSemana = new Date(ahora);
        inicioSemana.setDate(ahora.getDate() - ahora.getDay());
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        return combineLatest([
            this.getUsuarios(),
            this.getEntrenadores(),
            this.getReservas(),
            this.getPagos()
        ]).pipe(
            map(([usuarios, entrenadores, reservas, pagos]) => {
                return {
                    totalUsuarios: usuarios.length,
                    totalEntrenadores: entrenadores.length,
                    totalReservas: reservas.length,
                    ingresosMes: pagos
                        .filter(p => new Date(p.fecha) >= inicioMes && p.estado === 'COMPLETADO')
                        .reduce((sum, p) => sum + p.comision, 0),
                    reservasHoy: reservas.filter(r => {
                        const fecha = new Date(r.fecha);
                        return fecha >= hoy;
                    }).length,
                    reservasSemana: reservas.filter(r => {
                        const fecha = new Date(r.fecha);
                        return fecha >= inicioSemana;
                    }).length
                };
            })
        );
    }

    // ==================== USUARIOS ====================

    getUsuarios(): Observable<Usuario[]> {
        return this.firestore.collection<Usuario>('users')
            .valueChanges({ idField: 'id' });
    }

    getUsuario(id: string): Observable<Usuario | undefined> {
        return this.firestore.doc<Usuario>(`users/${id}`)
            .valueChanges({ idField: 'id' });
    }

    async actualizarUsuario(id: string, datos: Partial<Usuario>): Promise<{ success: boolean; message: string }> {
        try {
            await this.firestore.doc(`users/${id}`).update(datos);
            return { success: true, message: 'Usuario actualizado' };
        } catch (error) {
            console.error('Error:', error);
            return { success: false, message: 'Error al actualizar usuario' };
        }
    }

    async desactivarUsuario(id: string): Promise<{ success: boolean; message: string }> {
        return this.actualizarUsuario(id, { activo: false });
    }

    async activarUsuario(id: string): Promise<{ success: boolean; message: string }> {
        return this.actualizarUsuario(id, { activo: true });
    }

    // ==================== ENTRENADORES ====================

    getEntrenadores(): Observable<Entrenador[]> {
        return this.firestore.collection<Entrenador>('entrenadores')
            .valueChanges({ idField: 'id' });
    }

    getEntrenador(id: string): Observable<Entrenador | undefined> {
        return this.firestore.doc<Entrenador>(`entrenadores/${id}`)
            .valueChanges({ idField: 'id' });
    }

    // Obtener documentos de verificación de un entrenador
    async getDocumentosEntrenador(id: string): Promise<DocumentosEntrenador | null> {
        try {
            const doc = await this.firestore.doc(`entrenadores/${id}`).get().toPromise();
            const data = doc?.data() as Entrenador | undefined;
            return data?.documentos || null;
        } catch (error) {
            console.error('Error obteniendo documentos:', error);
            return null;
        }
    }

    // Aprobar documentos de entrenador
    async aprobarDocumentos(id: string): Promise<{ success: boolean; message: string }> {
        try {
            await this.firestore.doc(`entrenadores/${id}`).update({
                'documentos.estadoVerificacion': 'APROBADO',
                verificado: true,
                activo: true,
                fechaAprobacion: new Date()
            });

            // Actualizar estado en usuarios
            await this.firestore.doc(`usuarios/${id}`).update({
                estado: 'ACTIVO'
            });

            return { success: true, message: 'Documentos aprobados y entrenador activado' };
        } catch (error) {
            console.error('Error:', error);
            return { success: false, message: 'Error al aprobar documentos' };
        }
    }

    // Rechazar documentos con motivo
    async rechazarDocumentos(id: string, motivo: string): Promise<{ success: boolean; message: string }> {
        try {
            await this.firestore.doc(`entrenadores/${id}`).update({
                'documentos.estadoVerificacion': 'RECHAZADO',
                'documentos.motivoRechazo': motivo,
                verificado: false,
                activo: false
            });

            // Actualizar estado en usuarios
            await this.firestore.doc(`usuarios/${id}`).update({
                estado: 'RECHAZADO',
                motivoRechazo: motivo
            });

            return { success: true, message: 'Documentos rechazados' };
        } catch (error) {
            console.error('Error:', error);
            return { success: false, message: 'Error al rechazar documentos' };
        }
    }

    async verificarEntrenador(id: string): Promise<{ success: boolean; message: string }> {
        try {
            // Actualizar el perfil del entrenador
            await this.firestore.doc(`entrenadores/${id}`).update({ 
                verificado: true,
                activo: true,
                fechaAprobacion: new Date()
            });
            
            // IMPORTANTE: También actualizar el estado en la colección users
            // para que el login permita el acceso
            await this.firestore.doc(`users/${id}`).update({ 
                estado: 'ACTIVO'
            });
            
            return { success: true, message: 'Entrenador verificado y activado' };
        } catch (error) {
            console.error('Error:', error);
            return { success: false, message: 'Error al verificar entrenador' };
        }
    }

    async desactivarEntrenador(id: string): Promise<{ success: boolean; message: string }> {
        try {
            // Actualizar el perfil del entrenador
            await this.firestore.doc(`entrenadores/${id}`).update({ 
                activo: false,
                verificado: false
            });
            
            // También actualizar el estado en users
            await this.firestore.doc(`users/${id}`).update({ 
                estado: 'RECHAZADO'
            });
            
            return { success: true, message: 'Entrenador rechazado' };
        } catch (error) {
            console.error('Error:', error);
            return { success: false, message: 'Error al rechazar entrenador' };
        }
    }

    // ==================== RESERVAS ====================

    getReservas(): Observable<Reserva[]> {
        return this.firestore.collection<Reserva>('reservas', ref =>
            ref.orderBy('fecha', 'desc')
        ).valueChanges({ idField: 'id' });
    }

    getReserva(id: string): Observable<Reserva | undefined> {
        return this.firestore.doc<Reserva>(`reservas/${id}`)
            .valueChanges({ idField: 'id' });
    }

    async cancelarReserva(id: string): Promise<{ success: boolean; message: string }> {
        try {
            await this.firestore.doc(`reservas/${id}`).update({ estado: 'CANCELADA' });
            return { success: true, message: 'Reserva cancelada' };
        } catch (error) {
            console.error('Error:', error);
            return { success: false, message: 'Error al cancelar reserva' };
        }
    }

    // ==================== PAGOS ====================

    getPagos(): Observable<Pago[]> {
        return this.firestore.collection<Pago>('pagos', ref =>
            ref.orderBy('fecha', 'desc')
        ).valueChanges({ idField: 'id' });
    }

    async reembolsarPago(id: string): Promise<{ success: boolean; message: string }> {
        try {
            await this.firestore.doc(`pagos/${id}`).update({ estado: 'REEMBOLSADO' });
            return { success: true, message: 'Pago reembolsado' };
        } catch (error) {
            console.error('Error:', error);
            return { success: false, message: 'Error al reembolsar pago' };
        }
    }

    // ==================== DEPORTES ====================

    getDeportes(): Observable<Deporte[]> {
        return this.firestore.collection<Deporte>('deportes')
            .valueChanges({ idField: 'id' });
    }

    async crearDeporte(deporte: Omit<Deporte, 'id'>): Promise<{ success: boolean; message: string }> {
        try {
            await this.firestore.collection('deportes').add(deporte);
            return { success: true, message: 'Deporte creado' };
        } catch (error) {
            console.error('Error:', error);
            return { success: false, message: 'Error al crear deporte' };
        }
    }

    async actualizarDeporte(id: string, datos: Partial<Deporte>): Promise<{ success: boolean; message: string }> {
        try {
            await this.firestore.doc(`deportes/${id}`).update(datos);
            return { success: true, message: 'Deporte actualizado' };
        } catch (error) {
            console.error('Error:', error);
            return { success: false, message: 'Error al actualizar deporte' };
        }
    }

    async eliminarDeporte(id: string): Promise<{ success: boolean; message: string }> {
        try {
            await this.firestore.doc(`deportes/${id}`).delete();
            return { success: true, message: 'Deporte eliminado' };
        } catch (error) {
            console.error('Error:', error);
            return { success: false, message: 'Error al eliminar deporte' };
        }
    }

    // ==================== REPORTES ====================

    getReporteMensual(año: number, mes: number): Observable<{
        totalReservas: number;
        reservasCompletadas: number;
        reservasCanceladas: number;
        ingresosTotales: number;
        comisionesPlatforma: number;
    }> {
        const inicioMes = new Date(año, mes, 1);
        const finMes = new Date(año, mes + 1, 0);

        return combineLatest([
            this.getReservas(),
            this.getPagos()
        ]).pipe(
            map(([reservas, pagos]) => {
                const reservasMes = reservas.filter(r => {
                    const fecha = new Date(r.fecha);
                    return fecha >= inicioMes && fecha <= finMes;
                });

                const pagosMes = pagos.filter(p => {
                    const fecha = new Date(p.fecha);
                    return fecha >= inicioMes && fecha <= finMes && p.estado === 'COMPLETADO';
                });

                return {
                    totalReservas: reservasMes.length,
                    reservasCompletadas: reservasMes.filter(r => r.estado === 'COMPLETADA').length,
                    reservasCanceladas: reservasMes.filter(r => r.estado === 'CANCELADA').length,
                    ingresosTotales: pagosMes.reduce((sum, p) => sum + p.monto, 0),
                    comisionesPlatforma: pagosMes.reduce((sum, p) => sum + p.comision, 0)
                };
            })
        );
    }
}
