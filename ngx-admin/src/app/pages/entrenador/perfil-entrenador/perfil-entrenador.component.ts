import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbToastrService } from '@nebular/theme';
import { EntrenadorFirebaseService } from '../../../@core/services/entrenador-firebase.service';
import { Entrenador } from '../../../@core/services/cliente-firebase.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ngx-perfil-entrenador',
  templateUrl: './perfil-entrenador.component.html',
  styleUrls: ['./perfil-entrenador.component.scss']
})
export class PerfilEntrenadorComponent implements OnInit, OnDestroy {
  perfilForm: FormGroup;
  editando = false;
  loading = true;
  guardando = false;

  // Para foto de perfil
  fotoUrl: string | null = null;
  fotoPreview: string | null = null;
  selectedFile: File | null = null;
  uploadingFoto = false;
  uploadProgress = 0;

  // Para galería de fotos
  galeria: string[] = [];
  galeriaPreview: string | null = null;
  selectedGaleriaFile: File | null = null;
  uploadingGaleria = false;
  uploadGaleriaProgress = 0;

  perfil: Entrenador | null = null;
  especialidades: string[] = [];
  certificaciones: string[] = [];
  deportes: string[] = [];
  modalidades: string[] = [];

  // Para edición
  nuevaEspecialidad = '';
  nuevoDeporte = '';
  nuevaCertificacion = '';

  // Opciones disponibles
  deportesDisponibles = [
    'Fútbol', 'Básquetbol', 'Tenis', 'Natación', 'Running', 
    'Ciclismo', 'Yoga', 'Pilates', 'CrossFit', 'Boxeo',
    'Artes Marciales', 'Volleyball', 'Golf', 'Gimnasia',
    'Entrenamiento Funcional', 'Pesas', 'Cardio', 'Fitness General'
  ];

  modalidadesDisponibles = [
    { value: 'presencial', label: 'Presencial' },
    { value: 'online', label: 'Online' }
  ];

  private subscription: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private toastrService: NbToastrService,
    private entrenadorFirebase: EntrenadorFirebaseService
  ) {
    this.perfilForm = this.fb.group({
      nombre: [{ value: '', disabled: true }, Validators.required],
      apellidoPaterno: [{ value: '', disabled: true }],
      bio: [{ value: '', disabled: true }],
      precio: [{ value: 500, disabled: true }, [Validators.required, Validators.min(0)]],
      precioOnline: [{ value: 400, disabled: true }, [Validators.required, Validators.min(0)]],
      telefono: [{ value: '', disabled: true }],
      whatsapp: [{ value: '', disabled: true }],
      ciudad: [{ value: '', disabled: true }],
      direccionEntrenamiento: [{ value: '', disabled: true }],
      activo: [{ value: true, disabled: true }]
    });
  }

  ngOnInit(): void {
    this.cargarPerfil();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  cargarPerfil(): void {
    this.loading = true;
    this.subscription = this.entrenadorFirebase.getMiPerfil().subscribe(perfil => {
      if (perfil) {
        this.perfil = perfil;
        this.especialidades = perfil.especialidades || [];
        this.certificaciones = perfil.certificaciones || [];
        this.deportes = perfil.deportes || [];
        this.modalidades = perfil.modalidades || [];
        this.fotoUrl = perfil.foto || null;
        this.galeria = (perfil as any).galeria || [];

        this.perfilForm.patchValue({
          nombre: perfil.nombre,
          apellidoPaterno: perfil.apellidoPaterno,
          bio: perfil.bio || perfil.descripcion || '',
          precio: perfil.precio || 500,
          precioOnline: perfil.precioOnline || 400,
          telefono: perfil.telefono || '',
          whatsapp: perfil.whatsapp || '',
          ciudad: perfil.ubicacion?.ciudad || '',
          direccionEntrenamiento: perfil.direccionEntrenamiento || '',
          activo: perfil.activo !== false
        });
      }
      this.loading = false;
    });
  }

  toggleEditar(): void {
    this.editando = !this.editando;
    if (this.editando) {
      this.perfilForm.enable();
    } else {
      this.perfilForm.disable();
      // Restaurar valores originales
      if (this.perfil) {
        this.especialidades = [...(this.perfil.especialidades || [])];
        this.certificaciones = [...(this.perfil.certificaciones || [])];
        this.deportes = [...(this.perfil.deportes || [])];
        this.modalidades = [...(this.perfil.modalidades || [])];
      }
    }
  }

  // Gestión de especialidades
  agregarEspecialidad(): void {
    const esp = this.nuevaEspecialidad.trim();
    if (esp && !this.especialidades.includes(esp)) {
      this.especialidades.push(esp);
      this.nuevaEspecialidad = '';
    }
  }

  eliminarEspecialidad(esp: string): void {
    this.especialidades = this.especialidades.filter(e => e !== esp);
  }

  // Gestión de deportes
  agregarDeporte(deporte: string): void {
    if (deporte && !this.deportes.includes(deporte)) {
      this.deportes.push(deporte);
    }
  }

  eliminarDeporte(deporte: string): void {
    this.deportes = this.deportes.filter(d => d !== deporte);
  }

  // Gestión de certificaciones
  agregarCertificacion(): void {
    const cert = this.nuevaCertificacion.trim();
    if (cert && !this.certificaciones.includes(cert)) {
      this.certificaciones.push(cert);
      this.nuevaCertificacion = '';
    }
  }

  eliminarCertificacion(cert: string): void {
    this.certificaciones = this.certificaciones.filter(c => c !== cert);
  }

  // Gestión de modalidades
  toggleModalidad(modalidad: string): void {
    if (this.modalidades.includes(modalidad)) {
      this.modalidades = this.modalidades.filter(m => m !== modalidad);
    } else {
      this.modalidades.push(modalidad);
    }
  }

  async guardar(): Promise<void> {
    if (this.perfilForm.valid) {
      this.guardando = true;
      const formValue = this.perfilForm.value;

      // Validar que tenga al menos un deporte
      if (this.deportes.length === 0) {
        this.toastrService.warning('Debes seleccionar al menos un deporte', 'Atención');
        this.guardando = false;
        return;
      }

      // Modalidad siempre es presencial
      this.modalidades = ['presencial'];

      const result = await this.entrenadorFirebase.actualizarPerfil({
        nombre: formValue.nombre,
        apellidoPaterno: formValue.apellidoPaterno,
        bio: formValue.bio,
        descripcion: formValue.bio, // Mantener sincronizado
        precio: formValue.precio,
        precioOnline: formValue.precioOnline,
        telefono: formValue.telefono,
        whatsapp: formValue.whatsapp,
        especialidades: this.especialidades,
        certificaciones: this.certificaciones,
        deportes: this.deportes,
        modalidades: this.modalidades,
        activo: formValue.activo,
        direccionEntrenamiento: formValue.direccionEntrenamiento,
        ubicacion: {
          ...this.perfil?.ubicacion,
          ciudad: formValue.ciudad
        }
      });

      if (result.success) {
        this.toastrService.success(result.message, 'Éxito');
        this.toggleEditar();
      } else {
        this.toastrService.danger(result.message, 'Error');
      }
      this.guardando = false;
    }
  }

  getDeportesDisponiblesFiltrados(): string[] {
    return this.deportesDisponibles.filter(d => !this.deportes.includes(d));
  }

  // ========== GESTIÓN DE FOTO DE PERFIL ==========

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.toastrService.warning('Por favor selecciona una imagen', 'Formato inválido');
        return;
      }

      // Validar tamaño (máximo 2MB para evitar problemas al comprimir)
      if (file.size > 2 * 1024 * 1024) {
        this.toastrService.warning('La imagen no debe superar los 2MB', 'Archivo muy grande');
        return;
      }

      this.selectedFile = file;

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.fotoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Comprimir imagen usando Canvas
   * Redimensiona a máximo 400x400 y comprime a JPEG 80%
   */
  private compressImage(file: File, maxWidth: number = 400, quality: number = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const img = new Image();
        img.onload = () => {
          // Calcular nuevas dimensiones
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          if (height > maxWidth) {
            width = (width * maxWidth) / height;
            height = maxWidth;
          }

          // Crear canvas y dibujar imagen redimensionada
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('No se pudo obtener contexto del canvas'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convertir a Base64 JPEG
          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve(base64);
        };
        img.onerror = () => reject(new Error('Error al cargar la imagen'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(file);
    });
  }

  async subirFoto(): Promise<void> {
    if (!this.selectedFile || !this.perfil?.id) {
      return;
    }

    this.uploadingFoto = true;
    this.uploadProgress = 0;

    try {
      // Simular progreso inicial
      this.uploadProgress = 20;

      // Comprimir imagen a Base64
      const base64Image = await this.compressImage(this.selectedFile, 400, 0.8);
      
      this.uploadProgress = 60;

      // Verificar tamaño del Base64 (debe ser < 900KB para dejar margen en document)
      const base64Size = base64Image.length * 0.75; // Aproximar bytes
      if (base64Size > 900 * 1024) {
        // Si es muy grande, comprimir más
        const compressedBase64 = await this.compressImage(this.selectedFile, 300, 0.6);
        this.uploadProgress = 80;
        
        // Guardar en Firestore
        const result = await this.entrenadorFirebase.actualizarPerfil({
          foto: compressedBase64
        });

        if (result.success) {
          this.fotoUrl = compressedBase64;
          this.fotoPreview = null;
          this.selectedFile = null;
          this.toastrService.success('Foto de perfil actualizada', 'Éxito');
        } else {
          this.toastrService.danger('Error al guardar la foto', 'Error');
        }
      } else {
        this.uploadProgress = 80;
        
        // Guardar Base64 directamente en Firestore
        const result = await this.entrenadorFirebase.actualizarPerfil({
          foto: base64Image
        });

        if (result.success) {
          this.fotoUrl = base64Image;
          this.fotoPreview = null;
          this.selectedFile = null;
          this.toastrService.success('Foto de perfil actualizada', 'Éxito');
        } else {
          this.toastrService.danger('Error al guardar la foto', 'Error');
        }
      }

      this.uploadProgress = 100;
    } catch (error) {
      console.error('Error al subir foto:', error);
      this.toastrService.danger('Error al procesar la imagen', 'Error');
    } finally {
      this.uploadingFoto = false;
    }
  }

  cancelarFoto(): void {
    this.selectedFile = null;
    this.fotoPreview = null;
  }

  getFotoActual(): string {
    if (this.fotoPreview) {
      return this.fotoPreview;
    }
    if (this.fotoUrl) {
      return this.fotoUrl;
    }
    return 'assets/images/nick.png';
  }

  // ========== GESTIÓN DE GALERÍA DE FOTOS ==========

  onGaleriaFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      if (!file.type.startsWith('image/')) {
        this.toastrService.warning('Por favor selecciona una imagen', 'Formato inválido');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        this.toastrService.warning('La imagen no debe superar los 2MB', 'Archivo muy grande');
        return;
      }

      if (this.galeria.length >= 6) {
        this.toastrService.warning('Máximo 6 fotos en la galería', 'Límite alcanzado');
        return;
      }

      this.selectedGaleriaFile = file;

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.galeriaPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async subirFotoGaleria(): Promise<void> {
    if (!this.selectedGaleriaFile || !this.perfil?.id) {
      return;
    }

    this.uploadingGaleria = true;
    this.uploadGaleriaProgress = 0;

    try {
      this.uploadGaleriaProgress = 20;

      const base64Image = await this.compressImage(this.selectedGaleriaFile, 800, 0.8);
      
      this.uploadGaleriaProgress = 60;

      // Agregar a la galería
      const nuevaGaleria = [...this.galeria, base64Image];
      
      this.uploadGaleriaProgress = 80;
      
      const result = await this.entrenadorFirebase.actualizarPerfil({
        galeria: nuevaGaleria
      } as any);

      if (result.success) {
        this.galeria = nuevaGaleria;
        this.galeriaPreview = null;
        this.selectedGaleriaFile = null;
        this.toastrService.success('Foto agregada a la galería', 'Éxito');
      } else {
        this.toastrService.danger('Error al guardar la foto', 'Error');
      }

      this.uploadGaleriaProgress = 100;
    } catch (error) {
      console.error('Error al subir foto de galería:', error);
      this.toastrService.danger('Error al procesar la imagen', 'Error');
    } finally {
      this.uploadingGaleria = false;
    }
  }

  async eliminarFotoGaleria(index: number): Promise<void> {
    if (index < 0 || index >= this.galeria.length) return;

    const nuevaGaleria = this.galeria.filter((_, i) => i !== index);
    
    const result = await this.entrenadorFirebase.actualizarPerfil({
      galeria: nuevaGaleria
    } as any);

    if (result.success) {
      this.galeria = nuevaGaleria;
      this.toastrService.success('Foto eliminada de la galería', 'Éxito');
    } else {
      this.toastrService.danger('Error al eliminar la foto', 'Error');
    }
  }

  cancelarFotoGaleria(): void {
    this.selectedGaleriaFile = null;
    this.galeriaPreview = null;
  }
}

