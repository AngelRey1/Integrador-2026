import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbToastrService } from '@nebular/theme';
import { AuthFirebaseService } from '../../../@core/services/auth-firebase.service';
import { ClienteFirebaseService } from '../../../@core/services/cliente-firebase.service';
import { Subscription } from 'rxjs';

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
export class PerfilClienteComponent implements OnInit, OnDestroy {
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
  cargandoPerfil = true;
  private perfilSubscription: Subscription;

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
    { value: 'futbol', label: 'Fútbol', icon: '⚽' },
    { value: 'basquetbol', label: 'Básquetbol', icon: '🏀' },
    { value: 'basketball', label: 'Basketball', icon: '🏀' },
    { value: 'tenis', label: 'Tenis', icon: '🎾' },
    { value: 'natacion', label: 'Natación', icon: '🏊' },
    { value: 'running', label: 'Running', icon: '🏃' },
    { value: 'ciclismo', label: 'Ciclismo', icon: '🚴' },
    { value: 'yoga', label: 'Yoga', icon: '🧘' },
    { value: 'pilates', label: 'Pilates', icon: '🤸' },
    { value: 'crossfit', label: 'CrossFit', icon: '🏋️' },
    { value: 'boxeo', label: 'Boxeo', icon: '🥊' },
    { value: 'beisbol', label: 'Béisbol', icon: '⚾' },
    { value: 'softball', label: 'Softball', icon: '🥎' },
    { value: 'artes-marciales', label: 'Artes Marciales', icon: '🥋' },
    { value: 'volleyball', label: 'Volleyball', icon: '🏐' },
    { value: 'golf', label: 'Golf', icon: '⛳' },
    { value: 'gimnasia', label: 'Gimnasia', icon: '🤸‍♀️' },
    { value: 'funcional', label: 'Entrenamiento Funcional', icon: '💪' },
    { value: 'pesas', label: 'Pesas', icon: '🏋️‍♂️' },
    { value: 'cardio', label: 'Cardio', icon: '❤️' },
    { value: 'fitness', label: 'Fitness General', icon: '🏃‍♂️' }
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
    private authFirebase: AuthFirebaseService,
    private clienteFirebase: ClienteFirebaseService
  ) {
    // Obtener email y nombre desde sesión Firebase
    const email = this.authFirebase.getEmail() || '';
    const nombreUsuario = this.authFirebase.getNombreUsuario() || '';
    
    // Generar una foto consistente basada en el nombre de usuario o email
    const fotoId = this.generarFotoIdHombre(nombreUsuario || email || 'usuario');
    
    // Inicializar datos desde token - se actualizarán desde Firebase
    this.usuario = {
      id: 1,
      nombre: '',
      apellidos: '',
      email: email,
      nombreUsuario: nombreUsuario,
      telefono: '',
      fecha_nacimiento: null,
      genero: '',
      direccion: {
        calle: '',
        ciudad: '',
        codigo_postal: '',
        pais: 'MX'
      },
      avatar: `https://randomuser.me/api/portraits/men/${fotoId}.jpg`
    };

    this.preferencias = {
      deportes_favoritos: [],
      nivel_experiencia: '',
      objetivos: [],
      dias_preferidos: [],
      horario_preferido: '',
      presupuesto_mensual: 0
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
    // Cargar perfil desde Firebase
    this.perfilSubscription = this.clienteFirebase.getMiPerfil().subscribe({
      next: (perfil) => {
        this.cargandoPerfil = false;
        if (perfil) {
          // Actualizar datos del usuario desde Firebase
          this.usuario = {
            ...this.usuario,
            nombre: perfil.nombre || this.usuario.nombre,
            apellidos: perfil.apellidos || this.usuario.apellidos,
            email: perfil.email || this.usuario.email,
            telefono: perfil.telefono || this.usuario.telefono,
            fecha_nacimiento: perfil.fechaNacimiento?.toDate ? perfil.fechaNacimiento.toDate() : perfil.fechaNacimiento || this.usuario.fecha_nacimiento,
            genero: perfil.genero || this.usuario.genero,
            direccion: {
              calle: perfil.direccion?.calle || this.usuario.direccion.calle,
              ciudad: perfil.direccion?.ciudad || this.usuario.direccion.ciudad,
              codigo_postal: perfil.direccion?.codigoPostal || this.usuario.direccion.codigo_postal,
              pais: perfil.direccion?.pais || this.usuario.direccion.pais
            },
            avatar: perfil.foto || this.usuario.avatar
          };
          
          // Actualizar preferencias si existen
          if (perfil.preferencias) {
            this.preferencias = {
              deportes_favoritos: perfil.preferencias.deportesFavoritos || this.preferencias.deportes_favoritos,
              nivel_experiencia: perfil.preferencias.nivelExperiencia || this.preferencias.nivel_experiencia,
              objetivos: perfil.preferencias.objetivos || this.preferencias.objetivos,
              dias_preferidos: perfil.preferencias.diasPreferidos || this.preferencias.dias_preferidos,
              horario_preferido: perfil.preferencias.horarioPreferido || this.preferencias.horario_preferido,
              presupuesto_mensual: perfil.preferencias.presupuestoMensual || this.preferencias.presupuesto_mensual
            };
          }
          
          // Actualizar notificaciones si existen
          if (perfil.notificaciones) {
            this.notificaciones = {
              email_nuevas_reservas: perfil.notificaciones.emailReservas ?? this.notificaciones.email_nuevas_reservas,
              email_recordatorios: perfil.notificaciones.emailRecordatorios ?? this.notificaciones.email_recordatorios,
              email_promociones: perfil.notificaciones.emailPromociones ?? this.notificaciones.email_promociones,
              sms_recordatorios: perfil.notificaciones.smsRecordatorios ?? this.notificaciones.sms_recordatorios,
              push_notificaciones: perfil.notificaciones.pushNotificaciones ?? this.notificaciones.push_notificaciones
            };
          }
          
          this.avatarPreview = this.usuario.avatar;
          this.cargarDatosUsuario();
        } else {
          // Si no hay perfil en Firebase, usar datos de sesión
          this.usuario.email = this.authFirebase.getEmail() || this.usuario.email;
          this.usuario.nombreUsuario = this.authFirebase.getNombreUsuario() || this.usuario.nombreUsuario;
          this.cargarDatosUsuario();
        }
      },
      error: (error) => {
        this.cargandoPerfil = false;
        console.error('Error al cargar perfil:', error);
        // Continuar con datos de sesión si hay error
        this.usuario.email = this.authFirebase.getEmail() || this.usuario.email;
        this.cargarDatosUsuario();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.perfilSubscription) {
      this.perfilSubscription.unsubscribe();
    }
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

    // Guardar en Firebase
    this.clienteFirebase.actualizarMiPerfil({
      nombre: formValue.nombre,
      apellidos: formValue.apellidos,
      telefono: formValue.telefono,
      fechaNacimiento: formValue.fecha_nacimiento,
      genero: formValue.genero,
      direccion: {
        calle: formValue.calle,
        ciudad: formValue.ciudad,
        codigoPostal: formValue.codigo_postal,
        pais: formValue.pais
      }
    }).then(result => {
      this.guardando = false;
      if (result.success) {
        this.editandoPerfil = false;
        this.perfilForm.disable();
        this.toastrService.success(result.message, 'Éxito');
      } else {
        this.toastrService.danger(result.message, 'Error');
      }
    }).catch(error => {
      this.guardando = false;
      this.toastrService.danger('Error al guardar el perfil', 'Error');
      console.error('Error guardando perfil:', error);
    });
  }

  async onFileSelected(event: any): Promise<void> {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 600000) { // 600KB para base64
        this.toastrService.warning('La imagen no debe superar 600KB', 'Advertencia');
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        this.avatarPreview = base64;
        
        // Guardar en Firebase
        this.guardando = true;
        const result = await this.clienteFirebase.actualizarFotoPerfil(base64);
        this.guardando = false;
        
        if (result.success) {
          this.usuario.avatar = base64;
          this.toastrService.success('Foto de perfil actualizada', 'Éxito');
        } else {
          this.toastrService.danger(result.message, 'Error');
          // Revertir preview
          this.avatarPreview = this.usuario.avatar;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  async cambiarPassword(): Promise<void> {
    if (this.passwordForm.invalid) {
      Object.keys(this.passwordForm.controls).forEach(key => {
        this.passwordForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.guardando = true;

    const formValue = this.passwordForm.value;
    const result = await this.clienteFirebase.cambiarPassword(
      formValue.password_actual,
      formValue.password_nueva
    );

    this.guardando = false;
    
    if (result.success) {
      this.passwordForm.reset();
      this.toastrService.success(result.message, 'Éxito');
    } else {
      this.toastrService.danger(result.message, 'Error');
    }
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

  async guardarPreferencias(): Promise<void> {
    this.guardando = true;
    
    const result = await this.clienteFirebase.actualizarMiPerfil({
      preferencias: {
        deportesFavoritos: this.preferencias.deportes_favoritos,
        nivelExperiencia: this.preferencias.nivel_experiencia,
        objetivos: this.preferencias.objetivos,
        diasPreferidos: this.preferencias.dias_preferidos,
        horarioPreferido: this.preferencias.horario_preferido,
        presupuestoMensual: this.preferencias.presupuesto_mensual
      }
    });
    
    this.guardando = false;
    if (result.success) {
      this.toastrService.success('Preferencias actualizadas correctamente', 'Éxito');
    } else {
      this.toastrService.danger(result.message, 'Error');
    }
  }

  async guardarNotificaciones(): Promise<void> {
    this.guardando = true;
    
    const result = await this.clienteFirebase.actualizarMiPerfil({
      notificaciones: {
        emailReservas: this.notificaciones.email_nuevas_reservas,
        emailRecordatorios: this.notificaciones.email_recordatorios,
        emailPromociones: this.notificaciones.email_promociones,
        smsRecordatorios: this.notificaciones.sms_recordatorios,
        pushNotificaciones: this.notificaciones.push_notificaciones
      }
    });
    
    this.guardando = false;
    if (result.success) {
      this.toastrService.success('Configuración de notificaciones actualizada', 'Éxito');
    } else {
      this.toastrService.danger(result.message, 'Error');
    }
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
