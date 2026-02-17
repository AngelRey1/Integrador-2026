import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface CloudinaryUploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  // Configuración de Cloudinary (usar variables de entorno en producción)
  private cloudName = 'sportconnecta'; // Cambiar por tu cloud name
  private uploadPreset = 'sportconnecta_upload'; // Crear un upload preset sin firma

  constructor(private http: HttpClient) {}

  /**
   * Generar URL de avatar por defecto usando UI Avatars
   */
  getDefaultAvatarUrl(name: string, size: number = 128): string {
    const initials = this.getInitials(name);
    const colors = [
      '3366ff', // Azul
      '00cc99', // Verde
      'ff6633', // Naranja
      '9966ff', // Púrpura
      'ff3366', // Rosa
      '33cccc', // Cyan
    ];
    
    // Seleccionar color basado en el nombre
    const colorIndex = name.length % colors.length;
    const bgColor = colors[colorIndex];
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=${bgColor}&color=fff&bold=true`;
  }

  /**
   * Obtener iniciales de un nombre
   */
  private getInitials(name: string): string {
    if (!name) return 'U';
    
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }

  /**
   * Subir imagen a Cloudinary
   */
  uploadImage(file: File): Observable<CloudinaryUploadResult> {
    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('folder', 'sportconnect/avatars');
    
    return this.http.post<any>(url, formData).pipe(
      map(response => ({
        success: true,
        url: response.secure_url,
        publicId: response.public_id
      })),
      catchError(error => {
        console.error('Error subiendo imagen a Cloudinary:', error);
        return of({
          success: false,
          error: error.message || 'Error al subir la imagen'
        });
      })
    );
  }

  /**
   * Obtener URL optimizada de Cloudinary
   */
  getOptimizedUrl(publicId: string, width: number = 300, height: number = 300): string {
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/c_fill,w_${width},h_${height},q_auto,f_auto/${publicId}`;
  }

  /**
   * Obtener URL de avatar (Cloudinary o generado)
   */
  getAvatarUrl(fotoUrl: string | undefined, nombre: string, size: number = 128): string {
    if (fotoUrl && fotoUrl.trim() !== '') {
      // Si es una URL de Cloudinary, optimizarla
      if (fotoUrl.includes('cloudinary')) {
        // Extraer public_id y generar URL optimizada
        const match = fotoUrl.match(/upload\/(.+)/);
        if (match) {
          return `https://res.cloudinary.com/${this.cloudName}/image/upload/c_fill,w_${size},h_${size},q_auto,f_auto/${match[1]}`;
        }
      }
      return fotoUrl;
    }
    
    return this.getDefaultAvatarUrl(nombre, size);
  }

  /**
   * Convertir archivo a Base64
   */
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Validar que el archivo sea una imagen
   */
  isValidImage(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  }

  /**
   * Validar tamaño del archivo (máx 5MB por defecto)
   */
  isValidSize(file: File, maxSizeMB: number = 5): boolean {
    const maxBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxBytes;
  }
}
