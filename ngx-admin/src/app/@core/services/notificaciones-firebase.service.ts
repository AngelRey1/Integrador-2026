import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

export interface Notificacion {
    id?: string;
    usuarioId: string;
    tipo: 'NUEVA_RESERVA' | 'RESERVA_CONFIRMADA' | 'RESERVA_CANCELADA' | 'NUEVA_RESENA' | 'PAGO_RECIBIDO' | 'GENERAL';
    titulo: string;
    mensaje: string;
    leida: boolean;
    datos?: {
        reservaId?: string;
        entrenadorId?: string;
        clienteId?: string;
        [key: string]: any;
    };
    fecha: Date;
}

@Injectable({
    providedIn: 'root'
})
export class NotificacionesFirebaseService {

    constructor(
        private firestore: AngularFirestore,
        private afAuth: AngularFireAuth
    ) { }

    /**
     * Obtener notificaciones del usuario actual en tiempo real
     */
    getMisNotificaciones(): Observable<Notificacion[]> {
        return this.afAuth.authState.pipe(
            switchMap(user => {
                if (!user) return of([]);

                return this.firestore.collection<Notificacion>('notificaciones', ref =>
                    ref.where('usuarioId', '==', user.uid)
                        .orderBy('fecha', 'desc')
                        .limit(20)
                ).valueChanges({ idField: 'id' });
            }),
            map(notificaciones => notificaciones.map(n => ({
                ...n,
                fecha: this.convertirFecha(n.fecha)
            })))
        );
    }

    /**
     * Obtener solo notificaciones no leídas
     */
    getNotificacionesNoLeidas(): Observable<Notificacion[]> {
        return this.afAuth.authState.pipe(
            switchMap(user => {
                if (!user) return of([]);

                return this.firestore.collection<Notificacion>('notificaciones', ref =>
                    ref.where('usuarioId', '==', user.uid)
                        .where('leida', '==', false)
                        .orderBy('fecha', 'desc')
                ).valueChanges({ idField: 'id' });
            })
        );
    }

    /**
     * Contar notificaciones no leídas
     */
    contarNoLeidas(): Observable<number> {
        return this.getNotificacionesNoLeidas().pipe(
            map(notificaciones => notificaciones.length)
        );
    }

    /**
     * Marcar notificación como leída
     */
    async marcarComoLeida(notificacionId: string): Promise<void> {
        await this.firestore.doc(`notificaciones/${notificacionId}`).update({
            leida: true
        });
    }

    /**
     * Marcar todas las notificaciones como leídas
     */
    async marcarTodasComoLeidas(): Promise<void> {
        const user = await this.afAuth.currentUser;
        if (!user) return;

        const snapshot = await this.firestore.collection('notificaciones', ref =>
            ref.where('usuarioId', '==', user.uid)
                .where('leida', '==', false)
        ).get().toPromise();

        const batch = this.firestore.firestore.batch();
        snapshot?.docs.forEach(doc => {
            batch.update(doc.ref, { leida: true });
        });

        await batch.commit();
    }

    /**
     * Crear una notificación
     */
    async crearNotificacion(notificacion: Omit<Notificacion, 'id' | 'fecha' | 'leida'>): Promise<string> {
        const docRef = await this.firestore.collection('notificaciones').add({
            ...notificacion,
            leida: false,
            fecha: new Date()
        });
        return docRef.id;
    }

    /**
     * Notificar nueva reserva al entrenador
     */
    async notificarNuevaReserva(entrenadorId: string, clienteNombre: string, reservaId: string): Promise<void> {
        await this.crearNotificacion({
            usuarioId: entrenadorId,
            tipo: 'NUEVA_RESERVA',
            titulo: '🎉 Nueva Reserva',
            mensaje: `${clienteNombre} ha solicitado una sesión contigo.`,
            datos: { reservaId }
        });
    }

    /**
     * Notificar confirmación de reserva al cliente
     */
    async notificarReservaConfirmada(clienteId: string, entrenadorNombre: string, reservaId: string): Promise<void> {
        await this.crearNotificacion({
            usuarioId: clienteId,
            tipo: 'RESERVA_CONFIRMADA',
            titulo: '✅ Reserva Confirmada',
            mensaje: `${entrenadorNombre} ha confirmado tu sesión.`,
            datos: { reservaId }
        });
    }

    /**
     * Notificar cancelación de reserva
     */
    async notificarReservaCancelada(usuarioId: string, motivo: string, reservaId: string): Promise<void> {
        await this.crearNotificacion({
            usuarioId: usuarioId,
            tipo: 'RESERVA_CANCELADA',
            titulo: '❌ Reserva Cancelada',
            mensaje: motivo || 'Tu reserva ha sido cancelada.',
            datos: { reservaId }
        });
    }

    /**
     * Notificar nueva reseña al entrenador
     */
    async notificarNuevaResena(entrenadorId: string, clienteNombre: string, calificacion: number): Promise<void> {
        await this.crearNotificacion({
            usuarioId: entrenadorId,
            tipo: 'NUEVA_RESENA',
            titulo: '⭐ Nueva Reseña',
            mensaje: `${clienteNombre} te dejó una reseña de ${calificacion} estrellas.`,
            datos: { calificacion }
        });
    }

    /**
     * Notificar pago recibido al entrenador
     */
    async notificarPagoRecibido(entrenadorId: string, monto: number): Promise<void> {
        await this.crearNotificacion({
            usuarioId: entrenadorId,
            tipo: 'PAGO_RECIBIDO',
            titulo: '💰 Pago Recibido',
            mensaje: `Has recibido un pago de $${monto.toFixed(2)} MXN.`,
            datos: { monto }
        });
    }

    /**
     * Eliminar notificación
     */
    async eliminarNotificacion(notificacionId: string): Promise<void> {
        await this.firestore.doc(`notificaciones/${notificacionId}`).delete();
    }

    /**
     * Eliminar todas las notificaciones leídas del usuario
     */
    async eliminarNotificacionesLeidas(): Promise<void> {
        const user = await this.afAuth.currentUser;
        if (!user) return;

        const snapshot = await this.firestore.collection('notificaciones', ref =>
            ref.where('usuarioId', '==', user.uid)
                .where('leida', '==', true)
        ).get().toPromise();

        const batch = this.firestore.firestore.batch();
        snapshot?.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
    }

    /**
     * Convertir timestamp de Firestore a Date
     */
    private convertirFecha(fecha: any): Date {
        if (fecha instanceof Date) return fecha;
        if (fecha?.seconds) return new Date(fecha.seconds * 1000);
        if (fecha?.toDate) return fecha.toDate();
        return new Date();
    }

    /**
     * Formatear fecha relativa (hace X tiempo)
     */
    formatearFechaRelativa(fecha: Date): string {
        const ahora = new Date();
        const diff = ahora.getTime() - fecha.getTime();
        const segundos = Math.floor(diff / 1000);
        const minutos = Math.floor(segundos / 60);
        const horas = Math.floor(minutos / 60);
        const dias = Math.floor(horas / 24);

        if (segundos < 60) return 'Ahora';
        if (minutos < 60) return `Hace ${minutos} min`;
        if (horas < 24) return `Hace ${horas}h`;
        if (dias < 7) return `Hace ${dias} días`;

        return fecha.toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'short'
        });
    }
}
