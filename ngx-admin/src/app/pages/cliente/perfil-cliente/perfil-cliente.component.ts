import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbToastrService } from '@nebular/theme';
import { AuthService } from '../../../@core/services/auth.service';

interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  nombreUsuario?: string; // Nombre de usuario del login
  telefono: string;
  fecha_nacimiento: Date;
  genero: string;
  direccion: {
    calle: string;
    ciudad: string;
    codigo_postal: string;
    pais: string;
  };
  avatar: string;
}

interface PreferenciasDeportivas {
  deportes_favoritos: string[];
  nivel_experiencia: string;
  objetivos: string[];
  dias_preferidos: string[];
  horario_preferido: string;
  presupuesto_mensual: number;
}

interface ConfiguracionNotificaciones {
  email_nuevas_reservas: boolean;
  email_recordatorios: boolean;
  email_promociones: boolean;
  sms_recordatorios: boolean;
  push_notificaciones: boolean;
}

@Component({
  selector: 'ngx-perfil-cliente',
  templateUrl: './perfil-cliente.component.html',
  styleUrls: ['./perfil-cliente.component.scss']
})
export class PerfilClienteComponent implements OnInit {
  // Forms
  perfilForm: FormGroup;
  passwordForm: FormGroup;
  
  // Data
  usuario: Usuario;
  preferencias: PreferenciasDeportivas;
  notificaciones: ConfiguracionNotificaciones;
  
  // Estados
  guardando = false;
  editandoPerfil = false;
  avatarPreview: string | ArrayBuffer | null = null;

  // Opciones para selects
  generosDisponibles = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'otro', label: 'Otro' },
    { value: 'prefiero_no_decir', label: 'Prefiero no decir' }
  ];

  paisesDisponibles = [
    { value: 'ES', label: 'España' },
    { value: 'MX', label: 'México' },
    { value: 'AR', label: 'Argentina' },
    { value: 'CO', label: 'Colombia' },
    { value: 'CL', label: 'Chile' }
  ];

  deportesDisponibles = [
    { value: 'yoga', label: 'Yoga', icon: '🧘' },
    { value: 'crossfit', label: 'CrossFit', icon: '🏋️' },
    { value: 'running', label: 'Running', icon: '🏃' },
    { value: 'natacion', label: 'Natación', icon: '🏊' },
    { value: 'ciclismo', label: 'Ciclismo', icon: '🚴' },
    { value: 'boxeo', label: 'Boxeo', icon: '🥊' },
    { value: 'pilates', label: 'Pilates', icon: '🤸' },
    { value: 'tenis', label: 'Tenis', icon: '🎾' }
  ];

  nivelesExperiencia = [
    { value: 'principiante', label: 'Principiante' },
    { value: 'intermedio', label: 'Intermedio' },
    { value: 'avanzado', label: 'Avanzado' },
    { value: 'profesional', label: 'Profesional' }
  ];

  objetivosDisponibles = [
    { value: 'perder_peso', label: 'Perder peso' },
    { value: 'ganar_musculo', label: 'Ganar músculo' },
    { value: 'mejorar_resistencia', label: 'Mejorar resistencia' },
    { value: 'flexibilidad', label: 'Aumentar flexibilidad' },
    { value: 'salud_general', label: 'Salud general' },
    { value: 'competicion', label: 'Preparación competición' }
  ];

  diasDisponibles = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miercoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' },
    { value: 'sabado', label: 'Sábado' },
    { value: 'domingo', label: 'Domingo' }
  ];

  horariosDisponibles = [
    { value: 'manana', label: 'Mañana (6:00 - 12:00)' },
    { value: 'mediodia', label: 'Mediodía (12:00 - 16:00)' },
    { value: 'tarde', label: 'Tarde (16:00 - 20:00)' },
    { value: 'noche', label: 'Noche (20:00 - 23:00)' }
  ];

  constructor(
    private fb: FormBuilder,
    private toastrService: NbToastrService,
    private authService: AuthService
  ) {
    // Obtener email y nombre de usuario del token JWT
    const tokenPayload = this.authService.decodeToken(this.authService.token || '');
    const email = tokenPayload?.email || 'usuario@example.com';
    const nombreUsuario = tokenPayload?.nombreUsuario || tokenPayload?.sub || 'usuario';
    
    // Generar una foto consistente de HOMBRE basada en el nombre de usuario o email
    // La misma función que se usa en el header para que sea la misma foto
    const fotoId = this.generarFotoIdHombre(nombreUsuario || email || 'usuario');
    
    // Inicializar datos mock
    this.usuario = {
      id: 1,
      nombre: 'Juan',
      apellidos: 'García López',
      email: email, // Email del token
      nombreUsuario: nombreUsuario, // Nombre de usuario del token
      telefono: '+34 612 345 678',
      fecha_nacimiento: new Date(1990, 5, 15),
      genero: 'masculino',
      direccion: {
        calle: 'Calle Mayor 123, 3º B',
        ciudad: 'Madrid',
        codigo_postal: '28013',
        pais: 'ES'
      },
      avatar: `https://randomuser.me/api/portraits/men/${fotoId}.jpg` // Misma foto de HOMBRE que en el header (fotos reales)
    };

    this.preferencias = {
      deportes_favoritos: ['yoga', 'running', 'natacion'],
      nivel_experiencia: 'intermedio',
      objetivos: ['perder_peso', 'mejorar_resistencia'],
      dias_preferidos: ['lunes', 'miercoles', 'viernes'],
      horario_preferido: 'tarde',
      presupuesto_mensual: 150
    };

    this.notificaciones = {
      email_nuevas_reservas: true,
      email_recordatorios: true,
      email_promociones: false,
      sms_recordatorios: true,
      push_notificaciones: true
    };

    // Inicializar forms
    this.perfilForm = this.fb.group({
      nombre: [{ value: '', disabled: true }, Validators.required],
      apellidos: [{ value: '', disabled: true }, Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      telefono: [{ value: '', disabled: true }, Validators.required],
      fecha_nacimiento: [{ value: null, disabled: true }],
      genero: [{ value: '', disabled: true }],
      calle: [{ value: '', disabled: true }],
      ciudad: [{ value: '', disabled: true }],
      codigo_postal: [{ value: '', disabled: true }],
      pais: [{ value: '', disabled: true }]
    });

    this.passwordForm = this.fb.group({
      password_actual: ['', Validators.required],
      password_nueva: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmar: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.avatarPreview = this.usuario.avatar;
  }

  ngOnInit(): void {
    // Actualizar email y nombre de usuario desde el token si está disponible
    const tokenPayload = this.authService.decodeToken(this.authService.token || '');
    if (tokenPayload) {
      if (tokenPayload.email) {
        this.usuario.email = tokenPayload.email;
      }
      if (tokenPayload.nombreUsuario || tokenPayload.sub) {
        this.usuario.nombreUsuario = tokenPayload.nombreUsuario || tokenPayload.sub;
      }
      
      // Actualizar la foto para que sea consistente con el header (siempre de HOMBRE)
      const nombreUsuario = tokenPayload.nombreUsuario || tokenPayload.sub || this.usuario.email;
      const fotoId = this.generarFotoIdHombre(nombreUsuario || 'usuario');
      this.usuario.avatar = `https://randomuser.me/api/portraits/men/${fotoId}.jpg`;
      this.avatarPreview = this.usuario.avatar;
    }
    
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario(): void {
    this.perfilForm.patchValue({
      nombre: this.usuario.nombre,
      apellidos: this.usuario.apellidos,
      email: this.usuario.email, // Mostrar el email/username del token
      telefono: this.usuario.telefono,
      fecha_nacimiento: this.usuario.fecha_nacimiento,
      genero: this.usuario.genero,
      calle: this.usuario.direccion.calle,
      ciudad: this.usuario.direccion.ciudad,
      codigo_postal: this.usuario.direccion.codigo_postal,
      pais: this.usuario.direccion.pais
    });
  }

  toggleEditarPerfil(): void {
    this.editandoPerfil = !this.editandoPerfil;
    
    if (this.editandoPerfil) {
      this.perfilForm.enable();
    } else {
      this.perfilForm.disable();
      this.cargarDatosUsuario();
    }
  }

  guardarPerfil(): void {
    if (this.perfilForm.invalid) {
      Object.keys(this.perfilForm.controls).forEach(key => {
        this.perfilForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.guardando = true;
    const formValue = this.perfilForm.value;

    // Actualizar objeto usuario
    this.usuario = {
      ...this.usuario,
      nombre: formValue.nombre,
      apellidos: formValue.apellidos,
      email: formValue.email,
      telefono: formValue.telefono,
      fecha_nacimiento: formValue.fecha_nacimiento,
      genero: formValue.genero,
      direccion: {
        calle: formValue.calle,
        ciudad: formValue.ciudad,
        codigo_postal: formValue.codigo_postal,
        pais: formValue.pais
      }
    };

    // Simular guardado
    setTimeout(() => {
      this.guardando = false;
      this.editandoPerfil = false;
      this.perfilForm.disable();
      this.toastrService.success('Perfil actualizado correctamente', 'Éxito');
      console.log('Usuario actualizado:', this.usuario);
    }, 1000);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2000000) { // 2MB
        this.toastrService.warning('La imagen no debe superar 2MB', 'Advertencia');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview = e.target?.result || null;
        this.usuario.avatar = this.avatarPreview as string;
        this.toastrService.success('Foto de perfil actualizada', 'Éxito');
      };
      reader.readAsDataURL(file);
    }
  }

  cambiarPassword(): void {
    if (this.passwordForm.invalid) {
      Object.keys(this.passwordForm.controls).forEach(key => {
        this.passwordForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.guardando = true;

    // Simular cambio de contraseña
    setTimeout(() => {
      this.guardando = false;
      this.passwordForm.reset();
      this.toastrService.success('Contraseña actualizada correctamente', 'Éxito');
      console.log('Contraseña cambiada');
    }, 1000);
  }

  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const nueva = form.get('password_nueva');
    const confirmar = form.get('password_confirmar');
    
    if (nueva && confirmar && nueva.value !== confirmar.value) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  toggleDeporte(deporte: string): void {
    const index = this.preferencias.deportes_favoritos.indexOf(deporte);
    if (index > -1) {
      this.preferencias.deportes_favoritos.splice(index, 1);
    } else {
      this.preferencias.deportes_favoritos.push(deporte);
    }
  }

  isDeporteSelected(deporte: string): boolean {
    return this.preferencias.deportes_favoritos.includes(deporte);
  }

  toggleObjetivo(objetivo: string): void {
    const index = this.preferencias.objetivos.indexOf(objetivo);
    if (index > -1) {
      this.preferencias.objetivos.splice(index, 1);
    } else {
      this.preferencias.objetivos.push(objetivo);
    }
  }

  isObjetivoSelected(objetivo: string): boolean {
    return this.preferencias.objetivos.includes(objetivo);
  }

  toggleDia(dia: string): void {
    const index = this.preferencias.dias_preferidos.indexOf(dia);
    if (index > -1) {
      this.preferencias.dias_preferidos.splice(index, 1);
    } else {
      this.preferencias.dias_preferidos.push(dia);
    }
  }

  isDiaSelected(dia: string): boolean {
    return this.preferencias.dias_preferidos.includes(dia);
  }

  guardarPreferencias(): void {
    this.guardando = true;
    
    setTimeout(() => {
      this.guardando = false;
      this.toastrService.success('Preferencias actualizadas correctamente', 'Éxito');
      console.log('Preferencias actualizadas:', this.preferencias);
    }, 1000);
  }

  guardarNotificaciones(): void {
    this.guardando = true;
    
    setTimeout(() => {
      this.guardando = false;
      this.toastrService.success('Configuración de notificaciones actualizada', 'Éxito');
      console.log('Notificaciones actualizadas:', this.notificaciones);
    }, 1000);
  }

  eliminarCuenta(): void {
    if (confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      console.log('Cuenta eliminada');
      this.toastrService.info('Cuenta eliminada correctamente', 'Información');
    }
  }

  get nombreCompleto(): string {
    return `${this.usuario.nombre} ${this.usuario.apellidos}`;
  }

  // Generar un ID de foto consistente de HOMBRE basado en el nombre de usuario o email
  // La misma función que se usa en el header para que sea la misma foto
  // Usa solo IDs específicos que son fotos de hombres en pravatar.cc
  private generarFotoIdHombre(texto: string): number {
    // Usa randomuser.me que tiene fotos reales de HOMBRES (rango 0-99)
    // TODAS las fotos en /portraits/men/ son de HOMBRES
    let hash = 0;
    for (let i = 0; i < texto.length; i++) {
      const char = texto.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32bit integer
    }
    // randomuser.me tiene 100 fotos de HOMBRES (0-99) - TODAS son de hombres
    return Math.abs(hash % 100);
  }

  get edad(): number {
    const hoy = new Date();
    const nacimiento = new Date(this.usuario.fecha_nacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }
}
