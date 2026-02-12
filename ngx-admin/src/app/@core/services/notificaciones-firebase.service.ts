import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthFirebaseService } from './auth-firebase.service';

export interface Notificacion {
  id?: string;
  usuarioId: string;
  titulo: string;
  mensaje: string;
  tipo: 'reserva' | 'pago' | 'review' | 'sistema' | 'aprobacion';
  leida: boolean;
  fechaCreacion: Date;
  fechaLeida?: Date;
  datos?: {
    reservaId?: string;
    entrenadorId?: string;
    clienteId?: string;
    [key: string]: any;
  };
}

@Injectable({ providedIn: 'root' })
export class NotificacionesFirebaseService {
  constructor(
    private firestore: AngularFirestore,
    private authFirebase: AuthFirebaseService
  ) {}

  /**
   * Obtener todas las notificaciones del usuario actual
   */
  getMisNotificaciones(): Observable<Notificacion[]> {
    const uid = this.authFirebase.getUid();
    
    if (!uid) {
      return of([]);
    }

    return this.firestore.collection<Notificacion>('notificaciones', ref =>
      ref.where('usuarioId', '==', uid)
         .orderBy('fechaCreacion', 'desc')
         .limit(50)
    ).valueChanges({ idField: 'id' }).pipe(
      catchError(error => {
        console.error('Error obteniendo notificaciones:', error);
        return of([]);
      })
    );
  }

  /**
   * Contar notificaciones no leídas
   */
  contarNoLeidas(): Observable<number> {
    const uid = this.authFirebase.getUid();
    
    if (!uid) {
      return of(0);
    }

    return this.firestore.collection<Notificacion>('notificaciones', ref =>
      ref.where('usuarioId', '==', uid)
         .where('leida', '==', false)
    ).valueChanges().pipe(
      map(notificaciones => notificaciones.length),
      catchError(error => {
        console.error('Error contando notificaciones:', error);
        return of(0);
      })
    );
  }

  /**
   * Marcar una notificación como leída
   */
  async marcarComoLeida(notificacionId: string): Promise<void> {
    try {
      await this.firestore.collection('notificaciones').doc(notificacionId).update({
        leida: true,
        fechaLeida: new Date()
      });
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      throw error;
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async marcarTodasComoLeidas(): Promise<void> {
    const uid = this.authFirebase.getUid();
    
    if (!uid) return;

    try {
      const snapshot = await this.firestore.collection('notificaciones', ref =>
        ref.where('usuarioId', '==', uid)
           .where('leida', '==', false)
      ).get().toPromise();

      if (snapshot && !snapshot.empty) {
        const batch = this.firestore.firestore.batch();
        snapshot.docs.forEach(doc => {
          batch.update(doc.ref, { leida: true, fechaLeida: new Date() });
        });
        await batch.commit();
      }
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
      throw error;
    }
  }

  /**
   * Crear una nueva notificación
   */
  async crearNotificacion(notificacion: Omit<Notificacion, 'id'>): Promise<string> {
    try {
      const docRef = await this.firestore.collection('notificaciones').add({
        ...notificacion,
        fechaCreacion: new Date(),
        leida: false
      });
      return docRef.id;
    } catch (error) {
      console.error('Error al crear notificación:', error);
      throw error;
    }
  }

  /**
   * Eliminar una notificación
   */
  async eliminarNotificacion(notificacionId: string): Promise<void> {
    try {
      await this.firestore.collection('notificaciones').doc(notificacionId).delete();
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      throw error;
    }
  }

  /**
   * Notificar nueva reserva al entrenador
   */
  async notificarNuevaReserva(entrenadorId: string, clienteNombre: string, fecha: string): Promise<void> {
    await this.crearNotificacion({
      usuarioId: entrenadorId,
      titulo: 'Nueva Reserva',
      mensaje: `${clienteNombre} ha solicitado una reserva para el ${fecha}`,
      tipo: 'reserva',
      leida: false,
      fechaCreacion: new Date()
    });
  }

  /**
   * Notificar confirmación de reserva al cliente
   */
  async notificarReservaConfirmada(clienteId: string, entrenadorNombre: string, fecha: string): Promise<void> {
    await this.crearNotificacion({
      usuarioId: clienteId,
      titulo: 'Reserva Confirmada',
      mensaje: `Tu reserva con ${entrenadorNombre} para el ${fecha} ha sido confirmada`,
      tipo: 'reserva',
      leida: false,
      fechaCreacion: new Date()
    });
  }

  /**
   * Notificar pago recibido
   */
  async notificarPagoRecibido(entrenadorId: string, monto: number): Promise<void> {
    await this.crearNotificacion({
      usuarioId: entrenadorId,
      titulo: 'Pago Recibido',
      mensaje: `Has recibido un pago de $${monto.toFixed(2)}`,
      tipo: 'pago',
      leida: false,
      fechaCreacion: new Date()
    });
  }

  /**
   * Formatear fecha de forma relativa (hace 5 minutos, hace 2 horas, etc.)
   */
  formatearFechaRelativa(fecha: Date | any): string {
    if (!fecha) return '';
    
    // Convertir de Firestore Timestamp si es necesario
    const date = fecha.toDate ? fecha.toDate() : new Date(fecha);
    const ahora = new Date();
    const diffMs = ahora.getTime() - date.getTime();
    const diffSeg = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSeg / 60);
    const diffHoras = Math.floor(diffMin / 60);
    const diffDias = Math.floor(diffHoras / 24);

    if (diffSeg < 60) {
      return 'Hace un momento';
    } else if (diffMin < 60) {
      return `Hace ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffHoras < 24) {
      return `Hace ${diffHoras} ${diffHoras === 1 ? 'hora' : 'horas'}`;
    } else if (diffDias < 7) {
      return `Hace ${diffDias} ${diffDias === 1 ? 'día' : 'días'}`;
    } else if (diffDias < 30) {
      const semanas = Math.floor(diffDias / 7);
      return `Hace ${semanas} ${semanas === 1 ? 'semana' : 'semanas'}`;
    } else {
      return date.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== ahora.getFullYear() ? 'numeric' : undefined
      });
    }
  }
}
