import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface MensajeAdmin {
  id?: string;
  texto: string;
  senderId: string;
  senderNombre: string;
  senderTipo: 'admin' | 'entrenador';
  timestamp: Date;
  leido: boolean;
}

export interface ConversacionAdmin {
  id?: string;
  adminId: string;
  adminNombre: string;
  entrenadorId: string;
  entrenadorNombre: string;
  ultimoMensaje: string;
  ultimoMensajeTimestamp: Date;
  noLeidosAdmin: number;
  noLeidosEntrenador: number;
  activa: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminChatService {

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) { }

  // Obtener conversaciones del entrenador con admin
  getMisConversacionesConAdmin(): Observable<ConversacionAdmin[]> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (!user) return of([]);
        return this.firestore.collection<ConversacionAdmin>('conversacionesAdmin', ref =>
          ref.where('entrenadorId', '==', user.uid)
             .where('activa', '==', true)
             .orderBy('ultimoMensajeTimestamp', 'desc')
        ).snapshotChanges().pipe(
          map(actions => actions.map(a => ({
            id: a.payload.doc.id,
            ...a.payload.doc.data(),
            ultimoMensajeTimestamp: (a.payload.doc.data().ultimoMensajeTimestamp as any)?.toDate?.() || new Date()
          })))
        );
      })
    );
  }

  // Obtener mensajes de una conversación
  getMensajes(conversacionId: string): Observable<MensajeAdmin[]> {
    return this.firestore.collection('conversacionesAdmin')
      .doc(conversacionId)
      .collection<MensajeAdmin>('mensajes', ref =>
        ref.orderBy('timestamp', 'asc')
      ).snapshotChanges().pipe(
        map(actions => actions.map(a => ({
          id: a.payload.doc.id,
          ...a.payload.doc.data(),
          timestamp: (a.payload.doc.data().timestamp as any)?.toDate?.() || new Date()
        })))
      );
  }

  // Enviar mensaje como entrenador
  async enviarMensaje(conversacionId: string, texto: string): Promise<void> {
    const user = await this.afAuth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    // Obtener nombre del entrenador
    const entrenadorDoc = await this.firestore.collection('entrenadores').doc(user.uid).get().toPromise();
    const entrenadorNombre = (entrenadorDoc?.data() as any)?.nombre || 'Entrenador';

    const mensaje: MensajeAdmin = {
      texto,
      senderId: user.uid,
      senderNombre: entrenadorNombre,
      senderTipo: 'entrenador',
      timestamp: new Date(),
      leido: false
    };

    // Añadir mensaje
    await this.firestore.collection('conversacionesAdmin')
      .doc(conversacionId)
      .collection('mensajes')
      .add(mensaje);

    // Actualizar conversación
    const doc = await this.firestore.collection('conversacionesAdmin').doc(conversacionId).get().toPromise();
    const data = doc?.data() as ConversacionAdmin;

    await this.firestore.collection('conversacionesAdmin').doc(conversacionId).update({
      ultimoMensaje: texto,
      ultimoMensajeTimestamp: new Date(),
      noLeidosAdmin: (data?.noLeidosAdmin || 0) + 1
    });
  }

  // Marcar como leído
  async marcarComoLeido(conversacionId: string): Promise<void> {
    await this.firestore.collection('conversacionesAdmin').doc(conversacionId).update({
      noLeidosEntrenador: 0
    });

    // Marcar mensajes como leídos
    const mensajes = await this.firestore.collection('conversacionesAdmin')
      .doc(conversacionId)
      .collection('mensajes', ref => ref.where('leido', '==', false).where('senderTipo', '==', 'admin'))
      .get()
      .toPromise();

    const batch = this.firestore.firestore.batch();
    mensajes?.docs.forEach(doc => {
      batch.update(doc.ref, { leido: true });
    });
    await batch.commit();
  }

  // Contar mensajes no leídos del admin
  getNoLeidosCount(): Observable<number> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (!user) return of(0);
        return this.firestore.collection<ConversacionAdmin>('conversacionesAdmin', ref =>
          ref.where('entrenadorId', '==', user.uid)
             .where('activa', '==', true)
        ).valueChanges().pipe(
          map(convs => convs.reduce((sum, c) => sum + (c.noLeidosEntrenador || 0), 0))
        );
      })
    );
  }
}
