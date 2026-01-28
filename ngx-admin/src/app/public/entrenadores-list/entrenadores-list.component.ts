import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

interface Entrenador {
  id: number;
  nombre: string;
  ubicacion: string;
  foto: string;
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

@Component({
  selector: 'ngx-entrenadores-list',
  templateUrl: './entrenadores-list.component.html',
  styleUrls: ['./entrenadores-list.component.scss']
})
export class EntrenadoresListComponent implements OnInit {
  @ViewChild('filtrosSectionRef') filtrosSection: ElementRef;
  searchQuery = '';
  ubicacionQuery = '';
  
  filtros = {
    deporte: 'todos',
    precioMax: 500,
    modalidad: 'todos',
    nivel: 'todos',
    calificacionMin: 0
  };

  deportes = [
    'Todos',
    'Fútbol',
    'CrossFit',
    'Yoga',
    'Natación',
    'Running',
    'Boxeo',
    'Ciclismo',
    'Tenis',
    'Pilates',
    'Zumba',
    'Functional Training',
    'Spinning',
    'Artes Marciales',
    'Ballet Fitness',
    'Calistenia'
  ];

  // Lista completa de entrenadores (sincronizada con home)
  entrenadores: Entrenador[] = [
    {
      id: 1,
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
      id: 2,
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
      id: 3,
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
      id: 4,
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
      id: 5,
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
      id: 6,
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
      id: 7,
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
      id: 8,
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
      id: 9,
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
      id: 10,
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
      id: 11,
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
      id: 12,
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
      id: 13,
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
      id: 14,
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
      id: 15,
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

  entrenadoresDestacados: Entrenador[] = [];
  entrenadoresFiltrados: Entrenador[] = [];
  deporteActual: string = '';

  // Control del carrusel
  carruselIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.entrenadoresFiltrados = [...this.entrenadores];

    this.route.queryParams.subscribe(params => {
      // Reset filtros
      this.filtros.deporte = 'todos';
      this.searchQuery = '';
      this.deporteActual = '';

      if (params['deporte']) {
        const normalizado = params['deporte'].toLowerCase();
        const mapaDeportes: Record<string, string> = {
          futbol: 'Fútbol',
          fútbol: 'Fútbol',
          crossfit: 'CrossFit',
          yoga: 'Yoga',
          natacion: 'Natación',
          natación: 'Natación',
          running: 'Running',
          boxeo: 'Boxeo',
          ciclismo: 'Ciclismo',
          tenis: 'Tenis',
          pilates: 'Pilates',
          zumba: 'Zumba',
          funcional: 'Functional Training',
          functional: 'Functional Training',
          'functional training': 'Functional Training',
          spinning: 'Spinning',
          artes: 'Artes Marciales',
          'artes marciales': 'Artes Marciales',
          ballet: 'Ballet Fitness',
          calistenia: 'Calistenia'
        };
        this.filtros.deporte = mapaDeportes[normalizado] || params['deporte'];
        this.deporteActual = this.filtros.deporte;
      }
      if (params['q']) {
        this.searchQuery = (params['q'] as string).trim();
      }
      this.actualizarDestacados();
      // No hacer scroll en el primer render, solo aplicar filtros
      this.aplicarFiltros(false);
    });

    // Auto-scroll del carrusel cada 5 segundos
    setInterval(() => {
      this.siguienteDestacado();
    }, 5000);
  }

  actualizarDestacados() {
    // Filtrar destacados por el deporte actual
    if (this.deporteActual && this.deporteActual !== 'todos') {
      this.entrenadoresDestacados = this.entrenadores.filter(e => 
        e.destacado && e.deportes.some(d => d.toLowerCase() === this.deporteActual.toLowerCase())
      );
    } else {
      // Si no hay deporte específico, mostrar todos los destacados
      this.entrenadoresDestacados = this.entrenadores.filter(e => e.destacado);
    }
    
    // Resetear el índice del carrusel si no hay destacados
    if (this.entrenadoresDestacados.length === 0) {
      this.carruselIndex = 0;
    } else if (this.carruselIndex >= this.entrenadoresDestacados.length) {
      this.carruselIndex = 0;
    }
  }

  aplicarFiltros(triggerScroll: boolean = true) {
    // Actualizar deporte actual si cambió el filtro
    if (this.filtros.deporte !== 'todos' && this.filtros.deporte !== this.deporteActual) {
      this.deporteActual = this.filtros.deporte;
      this.actualizarDestacados();
    } else if (this.filtros.deporte === 'todos' && this.deporteActual !== '') {
      this.deporteActual = '';
      this.actualizarDestacados();
    }

    this.entrenadoresFiltrados = this.entrenadores.filter(e => {
      // Filtro de búsqueda
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        const match = e.nombre.toLowerCase().includes(query) ||
                     e.especialidad.toLowerCase().includes(query) ||
                     e.deportes.some(d => d.toLowerCase().includes(query));
        if (!match) return false;
      }

      // Filtro de deporte
      if (this.filtros.deporte !== 'todos') {
        if (!e.deportes.some(d => d.toLowerCase() === this.filtros.deporte.toLowerCase())) {
          return false;
        }
      }

      // Filtro de precio
      if (e.precioHora > this.filtros.precioMax) {
        return false;
      }

      // Filtro de calificación
      if (e.calificacion < this.filtros.calificacionMin) {
        return false;
      }

      return true;
    });

    // Scroll suave a la sección de filtros/resultados solo cuando viene de interacción del usuario
    if (triggerScroll) {
      setTimeout(() => {
        this.scrollToFiltros();
      }, 100);
    }
  }

  scrollToFiltros() {
    if (this.filtrosSection) {
      this.filtrosSection.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  irAtras() {
    // Siempre enviar al home público
    this.router.navigate(['/']);
  }

  verPerfil(entrenador: Entrenador) {
    this.router.navigate(['/entrenador', entrenador.id]);
  }

  getEstrellas(calificacion: number): string[] {
    const estrellas = [];
    for (let i = 0; i < 5; i++) {
      estrellas.push(i < Math.floor(calificacion) ? 'full' : 'empty');
    }
    return estrellas;
  }

  // Funciones del carrusel
  anteriorDestacado() {
    this.carruselIndex = (this.carruselIndex - 1 + this.entrenadoresDestacados.length) % this.entrenadoresDestacados.length;
  }

  siguienteDestacado() {
    this.carruselIndex = (this.carruselIndex + 1) % this.entrenadoresDestacados.length;
  }

  irADestacado(index: number) {
    this.carruselIndex = index;
  }

  getImagenDeporte(): string {
    if (!this.deporteActual || this.deporteActual === 'todos') {
      return '';
    }

    const imagenesDeportes: Record<string, string> = {
      'Fútbol': 'assets/images/deportes/futbol.jpg',
      'CrossFit': 'assets/images/deportes/crossfit.jpg',
      'Yoga': 'assets/images/deportes/yoga.webp',
      'Natación': 'assets/images/deportes/natacion.jpg',
      'Running': 'assets/images/deportes/running.jpg',
      'Boxeo': 'assets/images/deportes/boxeo.webp',
      'Ciclismo': 'assets/images/deportes/ciclismo.jpg',
      'Tenis': 'assets/images/deportes/tenis.jpg',
      'Pilates': 'assets/images/deportes/pilates.jpg',
      'Zumba': 'assets/images/deportes/zumba.jpg',
      'Functional Training': 'assets/images/deportes/funcional.png',
      'Spinning': 'assets/images/deportes/spinning.jpg',
      'Artes Marciales': 'assets/images/deportes/artes-marciales.webp',
      'Ballet Fitness': 'assets/images/deportes/ballet.webp',
      'Calistenia': 'assets/images/deportes/calistenia.avif'
    };

    return imagenesDeportes[this.deporteActual] || '';
  }

  getDeporteEntrenador(entrenador: Entrenador): string {
    // Si hay un deporte actual filtrado, usar ese
    if (this.deporteActual && this.deporteActual !== 'todos') {
      return this.deporteActual;
    }
    // Si no, usar la especialidad del entrenador
    return entrenador.especialidad;
  }
}
