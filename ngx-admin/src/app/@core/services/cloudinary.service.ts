import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CloudinaryUploadResult {
    public_id: string;
    secure_url: string;
    url: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
    original_filename: string;
}

export interface ImageUploadOptions {
    folder?: string;
    transformation?: string;
    maxWidth?: number;
    maxHeight?: number;
}

@Injectable({
    providedIn: 'root'
})
export class CloudinaryService {

    // Configuración de Cloudinary
    private readonly cloudName = 'difnotiok';
    private readonly uploadPreset = 'sportconecta_uploads';
    private readonly uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

    constructor(private http: HttpClient) { }

    /**
     * Subir una imagen a Cloudinary
     */
    uploadImage(file: File, options?: ImageUploadOptions): Observable<CloudinaryUploadResult> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', this.uploadPreset);

        if (options?.folder) {
            formData.append('folder', options.folder);
        }

        return this.http.post<CloudinaryUploadResult>(this.uploadUrl, formData);
    }

    /**
     * Subir imagen de perfil de usuario
     */
    uploadProfileImage(file: File, userId: string): Observable<CloudinaryUploadResult> {
        return this.uploadImage(file, {
            folder: `sportconnect/perfiles/${userId}`
        });
    }

    /**
     * Subir imagen de entrenador (perfil público)
     */
    uploadTrainerImage(file: File, trainerId: string): Observable<CloudinaryUploadResult> {
        return this.uploadImage(file, {
            folder: `sportconnect/entrenadores/${trainerId}`
        });
    }

    /**
     * Subir imagen a galería de entrenador
     */
    uploadGalleryImage(file: File, trainerId: string): Observable<CloudinaryUploadResult> {
        return this.uploadImage(file, {
            folder: `sportconnect/galeria/${trainerId}`
        });
    }

    /**
     * Subir certificación de entrenador
     */
    uploadCertification(file: File, trainerId: string): Observable<CloudinaryUploadResult> {
        return this.uploadImage(file, {
            folder: `sportconnect/certificaciones/${trainerId}`
        });
    }

    /**
     * Subir múltiples imágenes
     */
    uploadMultipleImages(files: File[], folder: string): Observable<CloudinaryUploadResult[]> {
        const uploads = files.map(file => this.uploadImage(file, { folder }).toPromise());
        return from(Promise.all(uploads)) as Observable<CloudinaryUploadResult[]>;
    }

    /**
     * Obtener URL optimizada de imagen
     * Cloudinary permite transformaciones on-the-fly
     */
    getOptimizedUrl(publicId: string, options?: {
        width?: number;
        height?: number;
        crop?: 'fill' | 'fit' | 'scale' | 'thumb';
        quality?: 'auto' | number;
    }): string {
        const baseUrl = `https://res.cloudinary.com/${this.cloudName}/image/upload`;

        const transforms: string[] = [];

        if (options?.width) transforms.push(`w_${options.width}`);
        if (options?.height) transforms.push(`h_${options.height}`);
        if (options?.crop) transforms.push(`c_${options.crop}`);
        if (options?.quality) transforms.push(`q_${options.quality}`);

        // Siempre agregar formato auto para optimización
        transforms.push('f_auto');

        const transformString = transforms.length > 0 ? transforms.join(',') + '/' : '';

        return `${baseUrl}/${transformString}${publicId}`;
    }

    /**
     * Obtener URL de avatar (cuadrado, optimizado)
     */
    getAvatarUrl(publicId: string, size: number = 150): string {
        return this.getOptimizedUrl(publicId, {
            width: size,
            height: size,
            crop: 'fill',
            quality: 'auto'
        });
    }

    /**
     * Obtener URL de thumbnail (para galerías)
     */
    getThumbnailUrl(publicId: string): string {
        return this.getOptimizedUrl(publicId, {
            width: 300,
            height: 200,
            crop: 'fill',
            quality: 'auto'
        });
    }

    /**
     * Generar avatar por defecto usando UI Avatars
     * Útil cuando el usuario no ha subido foto
     */
    getDefaultAvatarUrl(nombre: string, size: number = 150): string {
        const encodedName = encodeURIComponent(nombre || 'Usuario');
        return `https://ui-avatars.com/api/?name=${encodedName}&size=${size}&background=random&color=fff&bold=true`;
    }

    /**
     * Obtener URL de imagen o avatar por defecto
     */
    getImageOrDefault(imageUrl: string | null | undefined, nombre: string, size: number = 150): string {
        if (imageUrl && imageUrl.trim() !== '') {
            // Si es un public_id de Cloudinary
            if (!imageUrl.startsWith('http')) {
                return this.getAvatarUrl(imageUrl, size);
            }
            return imageUrl;
        }
        return this.getDefaultAvatarUrl(nombre, size);
    }

    /**
     * Validar archivo antes de subir
     */
    validateFile(file: File, options?: {
        maxSizeMB?: number;
        allowedTypes?: string[];
    }): { valid: boolean; error?: string } {
        const maxSize = (options?.maxSizeMB || 5) * 1024 * 1024; // Default 5MB
        const allowedTypes = options?.allowedTypes || ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        if (file.size > maxSize) {
            return {
                valid: false,
                error: `El archivo excede el tamaño máximo de ${options?.maxSizeMB || 5}MB`
            };
        }

        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: 'Tipo de archivo no permitido. Usa JPG, PNG, GIF o WebP'
            };
        }

        return { valid: true };
    }

    /**
     * Convertir File a Base64 (para preview)
     */
    fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    }
}
