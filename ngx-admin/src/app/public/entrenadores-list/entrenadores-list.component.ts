import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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
  selector: 'app-entrenadores-list',
  templateUrl: './entrenadores-list.component.html',
  styleUrls: ['./entrenadores-list.component.scss']
})
export class EntrenadoresListComponent implements OnInit {
  searchQuery = '';
  ubicacionQuery = '';
  
  filtros = {
    deporte: 'todos',
    precioMax: 100,
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
    'Tenis'
  ];

  // Carrusel de destacados
  entrenadoresDestacados: Entrenador[] = [
    {
      id: 1,
      nombre: 'Carlos Méndez',
      ubicacion: 'Ciudad de México',
      foto: 'https://i.pravatar.cc/400?img=12',
      especialidad: 'CrossFit',
      deportes: ['CrossFit', 'Funcional'],
      calificacion: 5,
      totalResenas: 89,
      precioHora: 35,
      destacado: true,
      nivel: 'ELITE',
      modalidad: ['Presencial', 'Online'],
      descripcion: 'Entrenador certificado con 10 años de experiencia'
    },
    {
      id: 2,
      nombre: 'Ana Rodríguez',
      ubicacion: 'Guadalajara',
      foto: 'https://i.pravatar.cc/400?img=47',
      especialidad: 'Yoga',
      deportes: ['Yoga', 'Pilates'],
      calificacion: 5,
      totalResenas: 124,
      precioHora: 28,
      destacado: true,
      nivel: 'PROFESIONAL',
      modalidad: ['Presencial', 'Online'],
      descripcion: 'Instructora certificada en Hatha y Vinyasa Yoga'
    },
    {
      id: 3,
      nombre: 'Miguel Torres',
      ubicacion: 'Monterrey',
      foto: 'https://i.pravatar.cc/400?img=33',
      especialidad: 'Fútbol',
      deportes: ['Fútbol'],
      calificacion: 5,
      totalResenas: 67,
      precioHora: 40,
      destacado: true,
      nivel: 'ELITE',
      modalidad: ['Presencial'],
      descripcion: 'Ex-futbolista profesional, entrenador UEFA Pro'
    }
  ];

  entrenadores: Entrenador[] = [
    ...this.entrenadoresDestacados,
    {
      id: 4,
      nombre: 'Laura Sánchez',
      ubicacion: 'Puebla',
      foto: 'https://i.pravatar.cc/400?img=45',
      especialidad: 'Running',
      deportes: ['Running', 'Atletismo'],
      calificacion: 4.8,
      totalResenas: 52,
      precioHora: 25,
      destacado: false,
      nivel: 'PROFESIONAL',
      modalidad: ['Presencial', 'Online'],
      descripcion: 'Corredora de maratones, especialista en técnica'
    },
    {
      id: 5,
      nombre: 'Roberto Jiménez',
      ubicacion: 'Ciudad de México',
      foto: 'https://i.pravatar.cc/400?img=15',
      especialidad: 'Natación',
      deportes: ['Natación'],
      calificacion: 4.9,
      totalResenas: 43,
      precioHora: 32,
      destacado: false,
      nivel: 'PROFESIONAL',
      modalidad: ['Presencial'],
      descripcion: 'Entrenador olímpico, especialista en técnica de nado'
    },
    {
      id: 6,
      nombre: 'Sofia Martínez',
      ubicacion: 'Querétaro',
      foto: 'https://i.pravatar.cc/400?img=48',
      especialidad: 'Boxeo',
      deportes: ['Boxeo', 'Defensa personal'],
      calificacion: 4.7,
      totalResenas: 38,
      precioHora: 30,
      destacado: false,
      nivel: 'PROFESIONAL',
      modalidad: ['Presencial'],
      descripcion: 'Boxeadora profesional con 8 años de experiencia'
    }
  ];

  entrenadoresFiltrados: Entrenador[] = [];

  // Control del carrusel
  carruselIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['deporte']) {
        this.filtros.deporte = params['deporte'];
      }
      if (params['q']) {
        this.searchQuery = params['q'];
      }
      this.aplicarFiltros();
    });

    // Auto-scroll del carrusel cada 5 segundos
    setInterval(() => {
      this.siguienteDestacado();
    }, 5000);
  }

  aplicarFiltros() {
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
}
