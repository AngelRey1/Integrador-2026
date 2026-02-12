import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  constructor(
    private firestore: AngularFirestore,
    private auth: AngularFireAuth
  ) {}

  // ========== FIRESTORE (Base de Datos) ==========
  
  /**
   * Obtener una colección completa
   */
  getCollection(collectionName: string): Observable<any[]> {
    return this.firestore.collection(collectionName).valueChanges({ idField: 'id' });
  }

  /**
   * Obtener un documento específico
   */
  getDocument(collectionName: string, docId: string): Observable<any> {
    return this.firestore.collection(collectionName).doc(docId).valueChanges();
  }

  /**
   * Crear un nuevo documento
   */
  createDocument(collectionName: string, data: any): Promise<any> {
    return this.firestore.collection(collectionName).add(data);
  }

  /**
   * Actualizar un documento
   */
  updateDocument(collectionName: string, docId: string, data: any): Promise<void> {
    return this.firestore.collection(collectionName).doc(docId).update(data);
  }

  /**
   * Eliminar un documento
   */
  deleteDocument(collectionName: string, docId: string): Promise<void> {
    return this.firestore.collection(collectionName).doc(docId).delete();
  }

  /**
   * Obtener documentos con filtros
   */
  getCollectionWithQuery(collectionName: string, field: string, operator: any, value: any): Observable<any[]> {
    return this.firestore.collection(collectionName, ref => 
      ref.where(field, operator, value)
    ).valueChanges({ idField: 'id' });
  }

  // ========== AUTHENTICATION ==========

  /**
   * Registrar un nuevo usuario
   */
  signUp(email: string, password: string): Promise<any> {
    return this.auth.createUserWithEmailAndPassword(email, password);
  }

  /**
   * Iniciar sesión
   */
  signIn(email: string, password: string): Promise<any> {
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  /**
   * Cerrar sesión
   */
  signOut(): Promise<void> {
    return this.auth.signOut();
  }

  /**
   * Obtener el usuario actual
   */
  getCurrentUser(): Observable<any> {
    return this.auth.authState;
  }

  /**
   * Enviar email de verificación
   */
  sendVerificationEmail(): Promise<void> {
    return this.auth.currentUser.then(user => user?.sendEmailVerification());
  }

  /**
   * Restablecer contraseña
   */
  resetPassword(email: string): Promise<void> {
    return this.auth.sendPasswordResetEmail(email);
  }

  // ========== NOTAS ==========
  // Firebase Storage fue removido porque requiere plan de pago.
  // Las imágenes se almacenan como Base64 directamente en Firestore.
}


