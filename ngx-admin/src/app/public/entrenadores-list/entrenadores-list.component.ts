import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { ClienteFirebaseService, Entrenador as EntrenadorFirebase } from '../../@core/services/cliente-firebase.service';

interface Entrenador {
  id: string;
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
export class EntrenadoresListComponent implements OnInit, OnDestroy {
  @ViewChild('filtrosSectionRef') filtrosSection: ElementRef;
  searchQuery = '';
  ubicacionQuery = '';
  loading = true;
  private subscription: Subscription;
  
  filtros = {
    deporte: 'todos',
    precioMax: 500,
    modalidad: 'todos',
    nivel: 'todos',
    calificacionMin: 0
  };

  deportes = [
    { value: 'todos', label: 'Todos los deportes' },
    { value: 'futbol', label: 'Fútbol' },
    { value: 'crossfit', label: 'CrossFit' },
    { value: 'yoga', label: 'Yoga' },
    { value: 'natacion', label: 'Natación' },
    { value: 'running', label: 'Running' },
    { value: 'boxeo', label: 'Boxeo' },
    { value: 'ciclismo', label: 'Ciclismo' },
    { value: 'tenis', label: 'Tenis' },
    { value: 'pilates', label: 'Pilates' },
    { value: 'zumba', label: 'Zumba' },
    { value: 'functional', label: 'Functional Training' },
    { value: 'spinning', label: 'Spinning' },
    { value: 'artes-marciales', label: 'Artes Marciales' },
    { value: 'ballet', label: 'Ballet Fitness' },
    { value: 'calistenia', label: 'Calistenia' }
  ];

  // Lista de entrenadores (se carga desde Firebase - NO MOCKUPS)
  entrenadores: Entrenador[] = [];

  entrenadoresDestacados: Entrenador[] = [];
  entrenadoresFiltrados: Entrenador[] = [];
  deporteActual: string = '';

  // Control del carrusel
  carruselIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private clienteFirebase: ClienteFirebaseService,
  ) {}

  ngOnInit(): void {
    // Habilitar scroll en la página pública (Nebular puede bloquearlo)
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    this.loading = true;
    
    // Cargar entrenadores desde Firebase
    this.subscription = this.clienteFirebase.getEntrenadores().subscribe({
      next: (entrenadoresFirebase) => {
        console.log('🔥 Entrenadores cargados desde Firebase:', entrenadoresFirebase.length);
        
        // Transformar datos de Firebase al formato del componente
        this.entrenadores = entrenadoresFirebase.map(e => this.transformarEntrenador(e));
        
        this.entrenadoresFiltrados = [...this.entrenadores];
        this.loading = false;
        
        // Procesar query params después de cargar datos
        this.procesarQueryParams();
      },
      error: (err) => {
        console.error('Error cargando entrenadores:', err);
        this.loading = false;
        // Sin mockups - solo datos reales de Firebase
        this.entrenadoresFiltrados = [];
        this.procesarQueryParams();
      }
    });

    // Suscripción a cambios en query params (solo procesar si hay parámetros nuevos)
    this.route.queryParams.subscribe(params => {
      if (!this.loading && (params['deporte'] || params['q'])) {
        this.procesarQueryParamsFromEvent(params);
      }
    });

    // Auto-scroll del carrusel cada 5 segundos
    setInterval(() => {
      this.siguienteDestacado();
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private transformarEntrenador(e: EntrenadorFirebase): Entrenador {
    return {
      id: e.id || '',
      nombre: `${e.nombre} ${e.apellidoPaterno || ''}`.trim(),
      ubicacion: e.ubicacion?.ciudad || 'México',
      foto: e.foto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      especialidad: e.deportes?.[0] || 'Fitness',
      deportes: e.deportes || [],
      calificacion: e.calificacionPromedio || 5.0,
      totalResenas: e.totalReviews || 0,
      precioHora: e.precio || 300,
      destacado: e.verificado && (e.calificacionPromedio >= 4.5 || e.totalReviews >= 10),
      nivel: this.determinarNivel(e),
      modalidad: e.modalidades || ['Presencial'],
      descripcion: e.bio || e.descripcion || 'Entrenador profesional'
    };
  }

  private determinarNivel(e: EntrenadorFirebase): 'BASICO' | 'PROFESIONAL' | 'ELITE' {
    if (e.certificaciones && e.certificaciones.length >= 3) return 'ELITE';
    if (e.certificaciones && e.certificaciones.length >= 1) return 'PROFESIONAL';
    return 'BASICO';
  }

  private procesarQueryParams(): void {
    const params = this.route.snapshot.queryParams;
    this.procesarQueryParamsFromEvent(params);
  }

  private procesarQueryParamsFromEvent(params: any): void {
    // Solo resetear si viene de query params de URL
    if (params['deporte']) {
      const normalizado = params['deporte'].toLowerCase();
      const mapaDeportes: Record<string, string> = {
        futbol: 'futbol',
        fútbol: 'futbol',
        crossfit: 'crossfit',
        yoga: 'yoga',
        natacion: 'natacion',
        natación: 'natacion',
        running: 'running',
        boxeo: 'boxeo',
        ciclismo: 'ciclismo',
        tenis: 'tenis',
        pilates: 'pilates',
        zumba: 'zumba',
        funcional: 'functional',
        functional: 'functional',
        'functional training': 'functional',
        spinning: 'spinning',
        artes: 'artes-marciales',
        'artes marciales': 'artes-marciales',
        ballet: 'ballet',
        calistenia: 'calistenia'
      };
      this.filtros.deporte = mapaDeportes[normalizado] || normalizado;
      this.deporteActual = this.filtros.deporte;
    }
    if (params['q']) {
      this.searchQuery = (params['q'] as string).trim();
    }
    this.actualizarDestacados();
    // No hacer scroll en el primer render, solo aplicar filtros
    this.aplicarFiltros(false);
  }

  actualizarDestacados() {
    // Filtrar destacados por el deporte actual
    if (this.deporteActual && this.deporteActual !== 'todos') {
      this.entrenadoresDestacados = this.entrenadores.filter(e => 
        e.destacado && e.deportes.some(d => this.normalizarDeporte(d) === this.deporteActual)
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
        const deporteNormalizado = this.filtros.deporte;
        const match = e.deportes.some(d => this.normalizarDeporte(d) === deporteNormalizado);
        if (!match) return false;
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

  // Normaliza un nombre de deporte para comparación
  normalizarDeporte(deporte: string): string {
    const mapeo: { [key: string]: string } = {
      'fútbol': 'futbol',
      'futbol': 'futbol',
      'natación': 'natacion',
      'natacion': 'natacion',
      'crossfit': 'crossfit',
      'yoga': 'yoga',
      'running': 'running',
      'boxeo': 'boxeo',
      'ciclismo': 'ciclismo',
      'tenis': 'tenis',
      'pilates': 'pilates',
      'zumba': 'zumba',
      'functional training': 'functional',
      'functional': 'functional',
      'spinning': 'spinning',
      'artes marciales': 'artes-marciales',
      'ballet fitness': 'ballet',
      'ballet': 'ballet',
      'calistenia': 'calistenia'
    };
    const lower = deporte.toLowerCase();
    return mapeo[lower] || lower.replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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
