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
  editado?: boolean;
  eliminado?: boolean;
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
  tipoConversacion?: 'cliente-entrenador' | 'soporte-cliente' | 'soporte-entrenador';
  participantes?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminChatService {

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) { }

  // Obtener o crear conversación entre admin y entrenador
  async obtenerOCrearConversacionAdmin(entrenadorId: string, entrenadorNombre: string): Promise<string> {
    const user = await this.afAuth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    // Buscar conversación existente
    const existente = await this.firestore.collection('conversaciones', ref =>
      ref.where('entrenadorId', '==', entrenadorId)
    ).get().toPromise();

    if (existente && !existente.empty) {
      return existente.docs[0].id;
    }

    // Crear nueva conversación
    const conversacion: ConversacionAdmin = {
      adminId: user.uid,
      adminNombre: 'Administrador',
      entrenadorId,
      entrenadorNombre,
      ultimoMensaje: '',
      ultimoMensajeTimestamp: new Date(),
      noLeidosAdmin: 0,
      noLeidosEntrenador: 0,
      activa: true,
      tipoConversacion: 'soporte-entrenador',
      participantes: [user.uid, entrenadorId]
    };

    const docRef = await this.firestore.collection('conversaciones').add(conversacion);
    return docRef.id;
  }

  // Obtener conversaciones del admin
  getConversaciones(): Observable<ConversacionAdmin[]> {
    return this.firestore.collection<ConversacionAdmin>('conversaciones', ref =>
      ref.where('activa', '==', true)
         .orderBy('ultimoMensajeTimestamp', 'desc')
    ).snapshotChanges().pipe(
      map(actions => actions.map(a => ({
        id: a.payload.doc.id,
        ...a.payload.doc.data(),
        ultimoMensajeTimestamp: (a.payload.doc.data().ultimoMensajeTimestamp as any)?.toDate?.() || new Date()
      })))
    );
  }

  // Obtener conversaciones desde la perspectiva del entrenador (para panel entrenador)
  getConversacionesEntrenadorConAdmin(): Observable<ConversacionAdmin[]> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (!user) return of([]);
        return this.firestore.collection<ConversacionAdmin>('conversaciones', ref =>
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
    return this.firestore.collection('conversaciones')
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

  // Enviar mensaje como admin
  async enviarMensaje(conversacionId: string, texto: string): Promise<void> {
    const user = await this.afAuth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const mensaje: MensajeAdmin = {
      texto,
      senderId: user.uid,
      senderNombre: 'Administrador',
      senderTipo: 'admin',
      timestamp: new Date(),
      leido: false,
      editado: false,
      eliminado: false
    };

    // Añadir mensaje
    await this.firestore.collection('conversaciones')
      .doc(conversacionId)
      .collection('mensajes')
      .add(mensaje);

    // Actualizar conversación
    const doc = await this.firestore.collection('conversaciones').doc(conversacionId).get().toPromise();
    const data = doc?.data() as ConversacionAdmin;

    await this.firestore.collection('conversaciones').doc(conversacionId).update({
      ultimoMensaje: texto,
      ultimoMensajeTimestamp: new Date(),
      noLeidosEntrenador: (data?.noLeidosEntrenador || 0) + 1
    });
  }

  // Enviar mensaje como entrenador (para el panel entrenador)
  async enviarMensajeEntrenador(conversacionId: string, texto: string): Promise<void> {
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
      leido: false,
      editado: false,
      eliminado: false
    };

    // Añadir mensaje
    await this.firestore.collection('conversaciones')
      .doc(conversacionId)
      .collection('mensajes')
      .add(mensaje);

    // Actualizar conversación
    const doc = await this.firestore.collection('conversaciones').doc(conversacionId).get().toPromise();
    const data = doc?.data() as ConversacionAdmin;

    await this.firestore.collection('conversaciones').doc(conversacionId).update({
      ultimoMensaje: texto,
      ultimoMensajeTimestamp: new Date(),
      noLeidosAdmin: (data?.noLeidosAdmin || 0) + 1
    });
  }

  // Editar un mensaje
  async editarMensaje(conversacionId: string, mensajeId: string, nuevoTexto: string): Promise<void> {
    await this.firestore.collection('conversaciones')
      .doc(conversacionId)
      .collection('mensajes')
      .doc(mensajeId)
      .update({
        texto: nuevoTexto,
        editado: true
      });
  }

  // Eliminar lógicamente un mensaje
  async eliminarMensaje(conversacionId: string, mensajeId: string): Promise<void> {
    await this.firestore.collection('conversaciones')
      .doc(conversacionId)
      .collection('mensajes')
      .doc(mensajeId)
      .update({
        texto: 'Este mensaje fue eliminado',
        eliminado: true
      });
  }

  // Marcar como leído
  async marcarComoLeido(conversacionId: string): Promise<void> {
    await this.firestore.collection('conversaciones').doc(conversacionId).update({
      noLeidosAdmin: 0
    });

    // Marcar mensajes como leídos
    const mensajes = await this.firestore.collection('conversaciones')
      .doc(conversacionId)
      .collection('mensajes', ref => ref.where('leido', '==', false).where('senderTipo', '==', 'entrenador'))
      .get()
      .toPromise();

    const batch = this.firestore.firestore.batch();
    mensajes?.docs.forEach(doc => {
      batch.update(doc.ref, { leido: true });
    });
    await batch.commit();
  }

  // Marcar como leído para entrenador
  async marcarComoLeidoEntrenador(conversacionId: string): Promise<void> {
    await this.firestore.collection('conversaciones').doc(conversacionId).update({
      noLeidosEntrenador: 0
    });

    // Marcar mensajes como leídos
    const mensajes = await this.firestore.collection('conversaciones')
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
}
