import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ReservaModalComponent } from '../reserva-modal/reserva-modal.component';
import { ClienteFirebaseService, Entrenador as EntrenadorFirebase } from '../../@core/services/cliente-firebase.service';

interface Resena {
  id: number;
  cliente: string;
  calificacion: number;
  comentario: string;
  fecha: string;
}

interface Horario {
  dia: string;
  disponible: boolean;
  horarios: string[];
}

interface Entrenador {
  id: string;
  nombre: string;
  foto: string;
  ubicacion: string;
  especialidad: string;
  deportes: string[];
  calificacion: number;
  totalResenas: number;
  precioHora: number;
  destacado: boolean;
  nivel: 'BASICO' | 'PROFESIONAL' | 'ELITE';
  modalidad: string[];
  descripcion: string;
}

type EntrenadorPerfil = Entrenador & {
  experiencia: number;
  certificaciones: string[];
  bio: string;
  logros: string[];
  whatsapp: string;
  email: string;
  idiomas: string[];
  fotos: string[];
};

@Component({
  selector: 'ngx-entrenador-perfil',
  templateUrl: './entrenador-perfil.component.html',
  styleUrls: ['./entrenador-perfil.component.scss']
})
export class EntrenadorPerfilComponent implements OnInit, OnDestroy {
  entrenadorId: string;
  loading = true;
  private subscription: Subscription;
  
  entrenadoresData: Entrenador[] = [
    {
      id: '1',
      nombre: 'Carlos Méndez',
      ubicacion: 'Mérida',
      foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      especialidad: 'Fútbol',
      deportes: ['Fútbol'],
      calificacion: 4.9,
      totalResenas: 127,
      precioHora: 350,
      destacado: true,
      nivel: 'ELITE',
      modalidad: ['Presencial'],
      descripcion: 'Entrenador certificado con 10 años de experiencia'
    },
    {
      id: '2',
      nombre: 'Ana García',
      ubicacion: 'Mérida',
      foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      especialidad: 'Yoga',
      deportes: ['Yoga', 'Pilates'],
      calificacion: 4.95,
      totalResenas: 89,
      precioHora: 280,
      destacado: true,
      nivel: 'PROFESIONAL',
      modalidad: ['Presencial', 'Online'],
      descripcion: 'Instructora certificada en Hatha y Vinyasa Yoga'
    },
    {
      id: '3',
      nombre: 'Jorge Sánchez',
      ubicacion: 'Mérida',
      foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      especialidad: 'CrossFit',
      deportes: ['CrossFit', 'Funcional'],
      calificacion: 4.8,
      totalResenas: 156,
      precioHora: 420,
      destacado: true,
      nivel: 'ELITE',
      modalidad: ['Presencial', 'Online'],
      descripcion: 'Entrenador certificado CrossFit Level 3'
    },
    {
      id: '4',
      nombre: 'María López',
      ubicacion: 'Mérida',
      foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      especialidad: 'Running',
      deportes: ['Running'],
      calificacion: 4.92,
      totalResenas: 103,
      precioHora: 300,
      destacado: true,
      nivel: 'PROFESIONAL',
      modalidad: ['Presencial', 'Online'],
      descripcion: 'Especialista en running y maratones'
    },
    {
      id: '5',
      nombre: 'Roberto Hernández',
      ubicacion: 'Mérida',
      foto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
      especialidad: 'Boxeo',
      deportes: ['Boxeo'],
      calificacion: 4.88,
      totalResenas: 142,
      precioHora: 380,
      destacado: true,
      nivel: 'ELITE',
      modalidad: ['Presencial'],
      descripcion: 'Boxeador profesional con 12 años de experiencia'
    },
    {
      id: '6',
      nombre: 'Laura Martínez',
      ubicacion: 'Mérida',
      foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
      especialidad: 'Natación',
      deportes: ['Natación'],
      calificacion: 4.93,
      totalResenas: 98,
      precioHora: 320,
      destacado: false,
      nivel: 'PROFESIONAL',
      modalidad: ['Presencial'],
      descripcion: 'Nadadora profesional y entrenadora certificada'
    },
    {
      id: '7',
      nombre: 'Diego Ramírez',
      ubicacion: 'Mérida',
      foto: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop',
      especialidad: 'Tenis',
      deportes: ['Tenis'],
      calificacion: 4.87,
      totalResenas: 76,
      precioHora: 400,
      destacado: false,
      nivel: 'ELITE',
      modalidad: ['Presencial'],
      descripcion: 'Ex-tenista profesional, entrenador certificado'
    },
    {
      id: '8',
      nombre: 'Sofia Torres',
      ubicacion: 'Mérida',
      foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
      especialidad: 'Pilates',
      deportes: ['Pilates', 'Yoga'],
      calificacion: 4.91,
      totalResenas: 112,
      precioHora: 290,
      destacado: false,
      nivel: 'PROFESIONAL',
      modalidad: ['Presencial', 'Online'],
      descripcion: 'Instructora certificada de Pilates Mat y Reformer'
    },
    {
      id: '9',
      nombre: 'Luis Fernández',
      ubicacion: 'Mérida',
      foto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
      especialidad: 'Ciclismo',
      deportes: ['Ciclismo'],
      calificacion: 4.85,
      totalResenas: 134,
      precioHora: 340,
      destacado: false,
      nivel: 'PROFESIONAL',
      modalidad: ['Presencial'],
      descripcion: 'Ciclista profesional y entrenador de ruta y montaña'
    },
    {
      id: '10',
      nombre: 'Valeria Rojas',
      ubicacion: 'Mérida',
      foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
      especialidad: 'Zumba',
      deportes: ['Zumba', 'Baile'],
      calificacion: 4.94,
      totalResenas: 187,
      precioHora: 250,
      destacado: false,
      nivel: 'PROFESIONAL',
      modalidad: ['Presencial', 'Online'],
      descripcion: 'Instructora certificada de Zumba y baile fitness'
    },
    {
      id: '11',
      nombre: 'Eduardo Morales',
      ubicacion: 'Mérida',
      foto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
      especialidad: 'Functional Training',
      deportes: ['Functional Training', 'CrossFit'],
      calificacion: 4.89,
      totalResenas: 121,
      precioHora: 370,
      destacado: false,
      nivel: 'ELITE',
      modalidad: ['Presencial'],
      descripcion: 'Especialista en entrenamiento funcional y acondicionamiento'
    },
    {
      id: '12',
      nombre: 'Patricia Silva',
      ubicacion: 'Mérida',
      foto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop',
      especialidad: 'Spinning',
      deportes: ['Spinning', 'Ciclismo'],
      calificacion: 4.86,
      totalResenas: 95,
      precioHora: 310,
      destacado: false,
      nivel: 'PROFESIONAL',
      modalidad: ['Presencial'],
      descripcion: 'Instructora certificada de spinning y cycling indoor'
    },
    {
      id: '13',
      nombre: 'Andrés Castillo',
      ubicacion: 'Mérida',
      foto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
      especialidad: 'Artes Marciales',
      deportes: ['Artes Marciales', 'Boxeo'],
      calificacion: 4.9,
      totalResenas: 108,
      precioHora: 390,
      destacado: false,
      nivel: 'ELITE',
      modalidad: ['Presencial'],
      descripcion: 'Maestro de artes marciales mixtas y defensa personal'
    },
    {
      id: '14',
      nombre: 'Camila Reyes',
      ubicacion: 'Mérida',
      foto: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop',
      especialidad: 'Ballet Fitness',
      deportes: ['Ballet Fitness', 'Baile'],
      calificacion: 4.92,
      totalResenas: 84,
      precioHora: 330,
      destacado: false,
      nivel: 'PROFESIONAL',
      modalidad: ['Presencial', 'Online'],
      descripcion: 'Bailarina profesional e instructora de ballet fitness'
    },
    {
      id: '15',
      nombre: 'Miguel Ángel Ortiz',
      ubicacion: 'Mérida',
      foto: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop',
      especialidad: 'Calistenia',
      deportes: ['Calistenia', 'Funcional'],
      calificacion: 4.88,
      totalResenas: 147,
      precioHora: 280,
      destacado: false,
      nivel: 'PROFESIONAL',
      modalidad: ['Presencial', 'Online'],
      descripcion: 'Especialista en calistenia y entrenamiento con peso corporal'
    }
  ];

  entrenador!: EntrenadorPerfil;

  resenas: Resena[] = [
    {
      id: 1,
      cliente: 'María González',
      calificacion: 5,
      comentario: 'Excelente entrenador, muy profesional y atento. He visto resultados increíbles en 3 meses.',
      fecha: '2026-01-15'
    },
    {
      id: 2,
      cliente: 'Juan Pérez',
      calificacion: 5,
      comentario: 'Carlos es el mejor! Sus sesiones son intensas pero efectivas. Totalmente recomendado.',
      fecha: '2026-01-10'
    },
    {
      id: 3,
      cliente: 'Ana Martínez',
      calificacion: 5,
      comentario: 'Gran experiencia. Muy paciente y conocedor. Me ayudó a mejorar mi técnica significativamente.',
      fecha: '2026-01-05'
    }
  ];

  horarios: Horario[] = [
    { dia: 'Lunes', disponible: true, horarios: ['06:00-08:00', '18:00-20:00'] },
    { dia: 'Martes', disponible: true, horarios: ['06:00-08:00', '18:00-20:00'] },
    { dia: 'Miércoles', disponible: true, horarios: ['06:00-08:00', '18:00-20:00'] },
    { dia: 'Jueves', disponible: true, horarios: ['06:00-08:00', '18:00-20:00'] },
    { dia: 'Viernes', disponible: true, horarios: ['06:00-08:00', '18:00-20:00'] },
    { dia: 'Sábado', disponible: true, horarios: ['08:00-12:00'] },
    { dia: 'Domingo', disponible: false, horarios: [] }
  ];

  tabActiva = 'sobre-mi';

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private dialog: MatDialog,
    private clienteFirebase: ClienteFirebaseService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.entrenadorId = params['id'];
      this.loading = true;
      this.cargarEntrenadorFirebase(this.entrenadorId);
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private cargarEntrenadorFirebase(id: string) {
    this.subscription = this.clienteFirebase.getEntrenadorPublico(id).subscribe({
      next: (entrenadorFirebase) => {
        if (entrenadorFirebase) {
          this.transformarDesdeFirebase(entrenadorFirebase);
          this.loading = false;
        } else {
          this.cargarEntrenadorMockup(id);
        }
      },
      error: (err) => {
        console.error('Error cargando entrenador:', err);
        this.cargarEntrenadorMockup(id);
      }
    });
  }

  private transformarDesdeFirebase(e: EntrenadorFirebase) {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const nombre = `${e.nombre} ${e.apellidoPaterno || ''}`.trim();
    const prefijo = e.nombre.toLowerCase();

    this.entrenador = {
      id: e.id || '',
      nombre: nombre,
      foto: e.foto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      ubicacion: e.ubicacion?.ciudad || 'México',
      especialidad: e.deportes?.[0] || 'Fitness',
      deportes: e.deportes || [],
      calificacion: e.calificacionPromedio || 5.0,
      totalResenas: e.totalReviews || 0,
      precioHora: e.precio || 300,
      destacado: e.verificado,
      nivel: this.determinarNivel(e),
      modalidad: e.modalidades || ['Presencial'],
      descripcion: e.bio || e.descripcion || 'Entrenador profesional',
      experiencia: 5,
      certificaciones: e.certificaciones || [`${e.deportes?.[0] || 'Fitness'} Certificado`],
      bio: e.bio || e.descripcion || 'Entrenador profesional dedicado a ayudarte a alcanzar tus metas.',
      logros: e.especialidades?.map(esp => `Especialista en ${esp}`) || ['Entrenador certificado'],
      whatsapp: e.whatsapp || e.telefono || '',
      email: e.email || `${prefijo}@sportconnect.com`,
      idiomas: ['Español'],
      fotos: [
        e.foto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=800'
      ]
    };
  }

  private determinarNivel(e: EntrenadorFirebase): 'BASICO' | 'PROFESIONAL' | 'ELITE' {
    if (e.certificaciones && e.certificaciones.length >= 3) return 'ELITE';
    if (e.certificaciones && e.certificaciones.length >= 1) return 'PROFESIONAL';
    return 'BASICO';
  }

  private cargarEntrenadorMockup(id: string) {
    const encontrado = this.entrenadoresData.find(e => e.id === id);

    if (!encontrado) {
      this.router.navigate(['/entrenadores']);
      return;
    }
    this.loading = false;

    window.scrollTo({ top: 0, behavior: 'smooth' });

    const prefijo = encontrado.nombre.split(' ')[0].toLowerCase();

    this.entrenador = {
      ...encontrado,
      experiencia: 10,
      certificaciones: [
        `${encontrado.especialidad} Nivel Avanzado`,
        'Certificación Internacional de Entrenamiento',
        'Primeros Auxilios y RCP'
      ],
      bio: encontrado.descripcion,
      logros: [
        'Más de 500 clientes satisfechos',
        'Programas personalizados con resultados medibles',
        'Mentor de atletas y entusiastas de alto rendimiento'
      ],
      whatsapp: `+521999${(parseInt(encontrado.id, 10) * 7311).toString().padStart(7, '0')}`,
      email: `${prefijo}@sportconnect.com`,
      idiomas: ['Español', 'Inglés'],
      fotos: [
        encontrado.foto.replace('w=400&h=400', 'w=800'),
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=800'
      ]
    };
  }

  getEstrellas(calificacion: number): string[] {
    const estrellas = [];
    for (let i = 0; i < 5; i++) {
      estrellas.push(i < Math.floor(calificacion) ? 'full' : 'empty');
    }
    return estrellas;
  }

  contactarWhatsApp() {
    if (!this.entrenador) return;
    const mensaje = encodeURIComponent(
      `Hola ${this.entrenador.nombre}, vi tu perfil en SportConnect y me gustaría reservar una sesión de ${this.entrenador.especialidad}.`
    );
    window.open(`https://wa.me/${this.entrenador.whatsapp}?text=${mensaje}`, '_blank');
  }

  cambiarTab(tab: string) {
    this.tabActiva = tab;
  }

  compartirPerfil() {
    if (!this.entrenador) return;
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${this.entrenador.nombre} - ${this.entrenador.especialidad}`,
        text: `Mira el perfil de este entrenador en SportConnect`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('¡Enlace copiado al portapapeles!');
    }
  }

  abrirModalReserva() {
    if (!this.entrenador) return;
    this.dialog.open(ReservaModalComponent, {
      width: '750px',
      maxWidth: '95vw',
      data: { entrenador: this.entrenador },
      disableClose: false,
      panelClass: 'modal-reserva-panel'
    });
  }
}
