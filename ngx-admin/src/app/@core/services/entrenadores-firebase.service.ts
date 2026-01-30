import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Servicio de ejemplo para manejar entrenadores con Firebase
 * Puedes usar este como referencia para crear otros servicios
 */
@Injectable({
  providedIn: 'root'
})
export class EntrenadoresFirebaseService {

  private readonly COLLECTION_NAME = 'entrenadores';

  constructor(private firebase: FirebaseService) {}

  /**
   * Obtener todos los entrenadores
   */
  getAllEntrenadores(): Observable<any[]> {
    return this.firebase.getCollection(this.COLLECTION_NAME);
  }

  /**
   * Obtener un entrenador por ID
   */
  getEntrenadorById(id: string): Observable<any> {
    return this.firebase.getDocument(this.COLLECTION_NAME, id);
  }

  /**
   * Buscar entrenadores por deporte
   */
  getEntrenadoresByDeporte(deporte: string): Observable<any[]> {
    return this.firebase.getCollectionWithQuery(
      this.COLLECTION_NAME,
      'deporte',
      '==',
      deporte
    );
  }

  /**
   * Buscar entrenadores verificados
   */
  getEntrenadoresVerificados(): Observable<any[]> {
    return this.firebase.getCollectionWithQuery(
      this.COLLECTION_NAME,
      'verificado',
      '==',
      true
    );
  }

  /**
   * Crear un nuevo entrenador
   */
  crearEntrenador(entrenador: any): Promise<any> {
    return this.firebase.createDocument(this.COLLECTION_NAME, {
      ...entrenador,
      fechaCreacion: new Date(),
      verificado: false
    });
  }

  /**
   * Actualizar un entrenador
   */
  actualizarEntrenador(id: string, datos: any): Promise<void> {
    return this.firebase.updateDocument(this.COLLECTION_NAME, id, {
      ...datos,
      fechaActualizacion: new Date()
    });
  }

  /**
   * Eliminar un entrenador
   */
  eliminarEntrenador(id: string): Promise<void> {
    return this.firebase.deleteDocument(this.COLLECTION_NAME, id);
  }

  /**
   * Obtener entrenadores destacados (con más de 4 estrellas)
   */
  getEntrenadoresDestacados(): Observable<any[]> {
    return this.firebase.getCollection(this.COLLECTION_NAME).pipe(
      map(entrenadores => 
        entrenadores.filter((e: any) => e.estrellas >= 4)
          .sort((a: any, b: any) => b.estrellas - a.estrellas)
          .slice(0, 6)
      )
    );
  }
}


