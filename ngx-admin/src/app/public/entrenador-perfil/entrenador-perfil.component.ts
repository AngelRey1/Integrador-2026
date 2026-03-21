import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ReservaModalComponent } from '../reserva-modal/reserva-modal.component';
import { ClienteFirebaseService, Entrenador as EntrenadorFirebase, Review } from '../../@core/services/cliente-firebase.service';

interface Resena {
  id: string;
  cliente: string;
  clienteFoto?: string;
  calificacion: number;
  comentario: string;
  fecha: string;
  respuestaEntrenador?: string;
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
  
  // Lightbox para ver fotos en grande
  lightboxAbierto: boolean = false;
  lightboxIndex: number = 0;
  lightboxFotoActual: string = '';
  
  // Sin mockups - solo datos reales desde Firebase

  entrenador!: EntrenadorPerfil;

  // Reseñas reales desde Firebase
  resenas: Resena[] = [];
  cargandoResenas = false;
  private resenasSubscription: Subscription | null = null;

  horarios: Horario[] = [];

  // Mapeo de nombres de días
  private diasMapping: { [key: string]: string } = {
    'lunes': 'Lunes',
    'martes': 'Martes',
    'miercoles': 'Miércoles',
    'jueves': 'Jueves',
    'viernes': 'Viernes',
    'sabado': 'Sábado',
    'domingo': 'Domingo'
  };

  tabActiva = 'sobre-mi';

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private dialog: MatDialog,
    private clienteFirebase: ClienteFirebaseService
  ) {}

  ngOnInit(): void {
    // Habilitar scroll en la página pública (Nebular puede bloquearlo)
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
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
    if (this.resenasSubscription) {
      this.resenasSubscription.unsubscribe();
    }
  }

  /**
   * Cargar reseñas reales desde Firebase
   */
  private cargarResenasFirebase(entrenadorId: string): void {
    if (!entrenadorId) return;
    
    this.cargandoResenas = true;
    this.resenasSubscription = this.clienteFirebase.getReviewsEntrenador(entrenadorId).subscribe({
      next: (reviews: Review[]) => {
        this.resenas = reviews.map(r => ({
          id: r.id || '',
          cliente: r.clienteNombre || 'Cliente',
          clienteFoto: r.clienteFoto,
          calificacion: r.calificacion || 5,
          comentario: r.comentario || '',
          fecha: r.fecha ? this.formatearFecha(r.fecha) : '',
          respuestaEntrenador: r.respuestaEntrenador
        }));
        this.cargandoResenas = false;
      },
      error: (err) => {
        console.error('Error cargando reseñas:', err);
        this.resenas = [];
        this.cargandoResenas = false;
      }
    });
  }

  private formatearFecha(fecha: any): string {
    if (!fecha) return '';
    const date = fecha.toDate ? fecha.toDate() : new Date(fecha);
    return date.toISOString().split('T')[0];
  }

  private cargarEntrenadorFirebase(id: string) {
    this.subscription = this.clienteFirebase.getEntrenadorPublico(id).subscribe({
      next: (entrenadorFirebase) => {
        if (entrenadorFirebase) {
          this.transformarDesdeFirebase(entrenadorFirebase);
          this.loading = false;
        } else {
          // Entrenador no encontrado - redirigir a lista
          console.warn('Entrenador no encontrado:', id);
          this.router.navigate(['/entrenadores']);
        }
      },
      error: (err) => {
        console.error('Error cargando entrenador:', err);
        this.router.navigate(['/entrenadores']);
      }
    });
  }

  private transformarDesdeFirebase(e: EntrenadorFirebase) {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const nombre = `${e.nombre} ${e.apellidoPaterno || ''}`.trim();
    const prefijo = e.nombre.toLowerCase();

    // Usar galería real si existe, combinar con foto de perfil
    const galeriaReal = (e as any).galeria || [];
    const fotoPerfil = e.foto || '';
    
    // Construir array de fotos: primero la galería, luego la foto de perfil si no está incluida
    let fotosFinales: string[] = [];
    
    if (galeriaReal.length > 0) {
      fotosFinales = [...galeriaReal];
      // Agregar foto de perfil si existe y no está ya en la galería
      if (fotoPerfil && !fotosFinales.includes(fotoPerfil)) {
        fotosFinales.unshift(fotoPerfil);
      }
    } else if (fotoPerfil) {
      // Si no hay galería, usar solo foto de perfil
      fotosFinales = [fotoPerfil];
    }

    // Limitar a máximo 6 fotos
    fotosFinales = fotosFinales.slice(0, 6);

    console.log('📸 Galería cargada:', fotosFinales.length, 'fotos');

    this.entrenador = {
      id: e.id || '',
      nombre: nombre,
      foto: e.foto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(nombre) + '&background=00D09C&color=fff&size=100',
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
      whatsapp: '',
      email: e.email || `${prefijo}@sportconnecta.com`,
      idiomas: ['Español'],
      fotos: fotosFinales
    };

    // Cargar reseñas reales desde Firebase
    this.cargarResenasFirebase(e.id || '');

    // Cargar horarios desde la disponibilidad de Firebase
    this.cargarHorariosDesdeDisponibilidad(e.disponibilidad);
  }

  /**
   * Convierte la disponibilidad de Firebase al formato de horarios para mostrar
   */
  private cargarHorariosDesdeDisponibilidad(disponibilidad: any) {
    const diasOrdenados = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    
    this.horarios = diasOrdenados.map(diaKey => {
      const nombreDia = this.diasMapping[diaKey];
      const rangos = disponibilidad?.[diaKey] || [];
      
      if (Array.isArray(rangos) && rangos.length > 0) {
        const horariosFormateados = rangos.map((rango: any) => {
          return `${rango.inicio || '09:00'}-${rango.fin || '18:00'}`;
        });
        
        return {
          dia: nombreDia,
          disponible: true,
          horarios: horariosFormateados
        };
      } else {
        return {
          dia: nombreDia,
          disponible: false,
          horarios: []
        };
      }
    });
  }

  private determinarNivel(e: EntrenadorFirebase): 'BASICO' | 'PROFESIONAL' | 'ELITE' {
    if (e.certificaciones && e.certificaciones.length >= 3) return 'ELITE';
    if (e.certificaciones && e.certificaciones.length >= 1) return 'PROFESIONAL';
    return 'BASICO';
  }

  getEstrellas(calificacion: number): string[] {
    const estrellas = [];
    for (let i = 0; i < 5; i++) {
      estrellas.push(i < Math.floor(calificacion) ? 'full' : 'empty');
    }
    return estrellas;
  }

  /**
   * Abre el lightbox para ver la foto en grande
   */
  abrirLightbox(index: number): void {
    if (!this.entrenador?.fotos?.length) return;
    this.lightboxIndex = index;
    this.lightboxFotoActual = this.entrenador.fotos[index];
    this.lightboxAbierto = true;
    document.body.style.overflow = 'hidden'; // Prevenir scroll
  }

  /**
   * Cierra el lightbox
   */
  cerrarLightbox(): void {
    this.lightboxAbierto = false;
    document.body.style.overflow = ''; // Restaurar scroll
  }

  @HostListener('window:keydown.esc')
  onEsc() {
    if (this.lightboxAbierto) {
      this.cerrarLightbox();
    }
  }

  @HostListener('window:keydown.ArrowRight')
  onArrowRight() {
    if (this.lightboxAbierto) {
      this.lightboxSiguiente();
    }
  }

  @HostListener('window:keydown.ArrowLeft')
  onArrowLeft() {
    if (this.lightboxAbierto) {
      this.lightboxAnterior();
    }
  }

  /**
   * Navega a la siguiente foto en el lightbox
   */
  lightboxSiguiente(): void {
    if (!this.entrenador?.fotos?.length) return;
    this.lightboxIndex = (this.lightboxIndex + 1) % this.entrenador.fotos.length;
    this.lightboxFotoActual = this.entrenador.fotos[this.lightboxIndex];
  }

  /**
   * Navega a la foto anterior en el lightbox
   */
  lightboxAnterior(): void {
    if (!this.entrenador?.fotos?.length) return;
    this.lightboxIndex = (this.lightboxIndex - 1 + this.entrenador.fotos.length) % this.entrenador.fotos.length;
    this.lightboxFotoActual = this.entrenador.fotos[this.lightboxIndex];
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
        text: `Mira el perfil de este entrenador en Sportconnecta`,
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
