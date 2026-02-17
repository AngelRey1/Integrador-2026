import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

export interface Mensaje {
  id?: string;
  texto: string;
  senderId: string;
  senderNombre: string;
  senderTipo: 'cliente' | 'entrenador';
  timestamp: Date;
  leido: boolean;
}

export interface Conversacion {
  id?: string;
  clienteId: string;
  clienteNombre: string;
  entrenadorId: string;
  entrenadorNombre: string;
  ultimoMensaje: string;
  ultimoMensajeTimestamp: Date;
  noLeidosCliente: number;
  noLeidosEntrenador: number;
  activa: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatFirebaseService {

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) { }

  // Obtener o crear conversación entre cliente y entrenador
  async obtenerOCrearConversacion(entrenadorId: string, entrenadorNombre: string): Promise<string> {
    const user = await this.afAuth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    // Buscar conversación existente
    const existente = await this.firestore.collection('conversaciones', ref =>
      ref.where('clienteId', '==', user.uid)
         .where('entrenadorId', '==', entrenadorId)
    ).get().toPromise();

    if (existente && !existente.empty) {
      return existente.docs[0].id;
    }

    // Obtener datos del cliente
    const clienteDoc = await this.firestore.collection('clientes').doc(user.uid).get().toPromise();
    const clienteData = clienteDoc?.data() as any;
    const clienteNombre = clienteData?.nombre || user.displayName || 'Cliente';

    // Crear nueva conversación
    const conversacion: Conversacion = {
      clienteId: user.uid,
      clienteNombre,
      entrenadorId,
      entrenadorNombre,
      ultimoMensaje: '',
      ultimoMensajeTimestamp: new Date(),
      noLeidosCliente: 0,
      noLeidosEntrenador: 0,
      activa: true
    };

    const docRef = await this.firestore.collection('conversaciones').add(conversacion);
    return docRef.id;
  }

  // Obtener conversaciones del cliente actual
  getMisConversacionesCliente(): Observable<Conversacion[]> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (!user) return of([]);
        return this.firestore.collection<Conversacion>('conversaciones', ref =>
          ref.where('clienteId', '==', user.uid)
             .where('activa', '==', true)
             .orderBy('ultimoMensajeTimestamp', 'desc')
        ).snapshotChanges().pipe(
          map(actions => actions.map(a => ({
            id: a.payload.doc.id,
            ...a.payload.doc.data()
          })))
        );
      })
    );
  }

  // Obtener conversaciones del entrenador actual
  getMisConversacionesEntrenador(): Observable<Conversacion[]> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (!user) return of([]);
        return this.firestore.collection<Conversacion>('conversaciones', ref =>
          ref.where('entrenadorId', '==', user.uid)
             .where('activa', '==', true)
             .orderBy('ultimoMensajeTimestamp', 'desc')
        ).snapshotChanges().pipe(
          map(actions => actions.map(a => ({
            id: a.payload.doc.id,
            ...a.payload.doc.data()
          })))
        );
      })
    );
  }

  // Obtener mensajes de una conversación
  getMensajes(conversacionId: string): Observable<Mensaje[]> {
    return this.firestore.collection('conversaciones')
      .doc(conversacionId)
      .collection<Mensaje>('mensajes', ref =>
        ref.orderBy('timestamp', 'asc')
      ).snapshotChanges().pipe(
        map(actions => actions.map(a => ({
          id: a.payload.doc.id,
          ...a.payload.doc.data(),
          timestamp: (a.payload.doc.data().timestamp as any)?.toDate?.() || new Date()
        })))
      );
  }

  // Enviar mensaje
  async enviarMensaje(conversacionId: string, texto: string, senderTipo: 'cliente' | 'entrenador'): Promise<void> {
    const user = await this.afAuth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    // Obtener nombre del sender
    let senderNombre = user.displayName || 'Usuario';
    if (senderTipo === 'cliente') {
      const clienteDoc = await this.firestore.collection('clientes').doc(user.uid).get().toPromise();
      senderNombre = (clienteDoc?.data() as any)?.nombre || senderNombre;
    } else {
      const entrenadorDoc = await this.firestore.collection('entrenadores').doc(user.uid).get().toPromise();
      senderNombre = (entrenadorDoc?.data() as any)?.nombre || senderNombre;
    }

    const mensaje: Mensaje = {
      texto,
      senderId: user.uid,
      senderNombre,
      senderTipo,
      timestamp: new Date(),
      leido: false
    };

    // Añadir mensaje
    await this.firestore.collection('conversaciones')
      .doc(conversacionId)
      .collection('mensajes')
      .add(mensaje);

    // Actualizar conversación
    const updateData: any = {
      ultimoMensaje: texto,
      ultimoMensajeTimestamp: new Date()
    };

    // Incrementar contador de no leídos para el otro usuario
    if (senderTipo === 'cliente') {
      updateData['noLeidosEntrenador'] = (await this.getNoLeidos(conversacionId, 'entrenador')) + 1;
    } else {
      updateData['noLeidosCliente'] = (await this.getNoLeidos(conversacionId, 'cliente')) + 1;
    }

    await this.firestore.collection('conversaciones').doc(conversacionId).update(updateData);
  }

  private async getNoLeidos(conversacionId: string, tipo: 'cliente' | 'entrenador'): Promise<number> {
    const doc = await this.firestore.collection('conversaciones').doc(conversacionId).get().toPromise();
    const data = doc?.data() as Conversacion;
    return tipo === 'cliente' ? (data?.noLeidosCliente || 0) : (data?.noLeidosEntrenador || 0);
  }

  // Marcar mensajes como leídos
  async marcarComoLeido(conversacionId: string, tipoUsuario: 'cliente' | 'entrenador'): Promise<void> {
    const field = tipoUsuario === 'cliente' ? 'noLeidosCliente' : 'noLeidosEntrenador';
    await this.firestore.collection('conversaciones').doc(conversacionId).update({
      [field]: 0
    });
  }

  // Obtener total de mensajes no leídos (para badge en menú)
  getTotalNoLeidos(tipoUsuario: 'cliente' | 'entrenador'): Observable<number> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (!user) return of(0);
        const field = tipoUsuario === 'cliente' ? 'clienteId' : 'entrenadorId';
        return this.firestore.collection<Conversacion>('conversaciones', ref =>
          ref.where(field, '==', user.uid)
             .where('activa', '==', true)
        ).valueChanges().pipe(
          map(convs => {
            const noLeidosField = tipoUsuario === 'cliente' ? 'noLeidosCliente' : 'noLeidosEntrenador';
            return convs.reduce((total, c) => total + ((c as any)[noLeidosField] || 0), 0);
          })
        );
      })
    );
  }

  // Obtener una conversación específica
  getConversacion(conversacionId: string): Observable<Conversacion | undefined> {
    return this.firestore.collection('conversaciones').doc<Conversacion>(conversacionId)
      .valueChanges()
      .pipe(map(data => data ? { ...data, id: conversacionId } : undefined));
  }
}
