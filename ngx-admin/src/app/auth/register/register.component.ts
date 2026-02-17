import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthFirebaseService } from '../../@core/services/auth-firebase.service';
import { Router, ActivatedRoute } from '@angular/router';

interface DocumentoSubido {
  nombre: string;
  tipo: string;
  base64: string;
  tamano: number;
}

@Component({
  selector: 'ngx-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  form: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  private requestedRole: string = 'CLIENTE';
  isClienteRegistro: boolean = true;

  // Documentos para entrenadores
  documentoINE: DocumentoSubido | null = null;
  documentoCertificacion: DocumentoSubido | null = null;
  uploadingINE = false;
  uploadingCert = false;
  inePreview: string | null = null;
  certPreview: string | null = null;

  // Paso actual del formulario de entrenador (1: datos, 2: documentos)
  pasoActual = 1;

  constructor(
    private fb: FormBuilder,
    private authFirebase: AuthFirebaseService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      terminos: [false, Validators.requiredTrue]
    }, { validators: this.passwordsMatch });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.requestedRole = params['rol'] || 'CLIENTE';
      this.isClienteRegistro = (this.requestedRole !== 'ENTRENADOR');
    });
  }

  passwordsMatch(group: FormGroup) {
    const p = group.get('password')?.value;
    const c = group.get('confirmPassword')?.value;
    return p === c ? null : { mismatch: true };
  }

  // Navegar al paso de documentos (solo entrenadores)
  irAPasoDocumentos() {
    if (this.form.get('nombre')?.invalid || this.form.get('apellido')?.invalid ||
        this.form.get('email')?.invalid || this.form.get('password')?.invalid ||
        this.form.get('confirmPassword')?.invalid || this.form.errors?.['mismatch']) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }
    this.pasoActual = 2;
  }

  volverAPasoDatos() {
    this.pasoActual = 1;
  }

  // Manejar selección de archivo INE
  onINESelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.procesarArchivo(input.files[0], 'ine');
    }
  }

  // Manejar selección de certificación
  onCertificacionSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.procesarArchivo(input.files[0], 'certificacion');
    }
  }

  private async procesarArchivo(file: File, tipo: 'ine' | 'certificacion'): Promise<void> {
    // Validar tipo de archivo (imágenes y PDF)
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!tiposPermitidos.includes(file.type)) {
      this.errorMessage = 'Formato no válido. Usa JPG, PNG o PDF';
      return;
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.errorMessage = 'El archivo no debe superar 2MB';
      return;
    }

    this.errorMessage = '';
    
    if (tipo === 'ine') {
      this.uploadingINE = true;
    } else {
      this.uploadingCert = true;
    }

    try {
      let base64: string;
      
      if (file.type.startsWith('image/')) {
        // Comprimir imágenes
        base64 = await this.comprimirImagen(file, 800, 0.7);
      } else {
        // PDF: convertir directamente a Base64
        base64 = await this.archivoABase64(file);
      }

      const documento: DocumentoSubido = {
        nombre: file.name,
        tipo: file.type,
        base64: base64,
        tamano: file.size
      };

      if (tipo === 'ine') {
        this.documentoINE = documento;
        this.inePreview = file.type.startsWith('image/') ? base64 : null;
        this.uploadingINE = false;
      } else {
        this.documentoCertificacion = documento;
        this.certPreview = file.type.startsWith('image/') ? base64 : null;
        this.uploadingCert = false;
      }
    } catch (error) {
      this.errorMessage = 'Error al procesar el archivo';
      if (tipo === 'ine') {
        this.uploadingINE = false;
      } else {
        this.uploadingCert = false;
      }
    }
  }

  private archivoABase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Error al leer archivo'));
      reader.readAsDataURL(file);
    });
  }

  private comprimirImagen(file: File, maxWidth: number, quality: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('No se pudo crear canvas'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => reject(new Error('Error al cargar imagen'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Error al leer archivo'));
      reader.readAsDataURL(file);
    });
  }

  eliminarINE(): void {
    this.documentoINE = null;
    this.inePreview = null;
  }

  eliminarCertificacion(): void {
    this.documentoCertificacion = null;
    this.certPreview = null;
  }

  async submit() {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    // Validar documentos para entrenadores
    if (!this.isClienteRegistro) {
      if (!this.documentoINE) {
        this.errorMessage = 'Debes subir tu identificación oficial (INE)';
        return;
      }
      if (!this.documentoCertificacion) {
        this.errorMessage = 'Debes subir al menos una certificación';
        return;
      }
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { nombre, apellido, email, password } = this.form.value;
    const rol = this.requestedRole;

    // Preparar documentos si es entrenador
    const documentos = !this.isClienteRegistro ? {
      ine: this.documentoINE,
      certificacion: this.documentoCertificacion
    } : undefined;

    const result = await this.authFirebase.register({
      nombre,
      apellido,
      email,
      password,
      rol,
      documentos
    });

    this.loading = false;

    if (result.success) {
      this.successMessage = result.message;
      
      setTimeout(() => {
        if (rol === 'ENTRENADOR') {
          this.router.navigate(['/auth/login'], {
            queryParams: { email, pending: true, rol: 'ENTRENADOR' }
          });
        } else {
          this.router.navigate(['/auth/login'], {
            queryParams: { email, registered: true, rol: 'CLIENTE' }
          });
        }
      }, 3000);
    } else {
      this.errorMessage = result.message;
    }
  }
}

