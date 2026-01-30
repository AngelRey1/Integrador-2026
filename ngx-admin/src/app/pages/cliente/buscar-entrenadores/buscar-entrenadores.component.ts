import { Component, OnInit } from '@angular/core';
import { NbDialogService } from '@nebular/theme';

interface Entrenador {
  id: number;
  nombre_completo: string;
  foto_url: string;
  especialidad: string;
  deportes: string[];
  calificacion: number;
  total_resenas: number;
  tarifa_por_hora: number;
  ubicacion: string;
  experiencia: number;
  nivel: string;
  modalidad: string[];
  disponibilidad: string;
  certificado: boolean;
  idiomas: string[];
}

interface Filtros {
  deporte: string;
  fecha: string;
  hora: string;
  precio_max: number | null;
  ubicacion: string;
  modalidad: string;
  nivel: string;
  calificacion_min: number;
  ordenarPor: string;
}

@Component({
  selector: 'ngx-buscar-entrenadores',
  templateUrl: './buscar-entrenadores.component.html',
  styleUrls: ['./buscar-entrenadores.component.scss']
})
export class BuscarEntrenadoresComponent implements OnInit {
  // Filtros
  filtros: Filtros = {
    deporte: '',
    fecha: '',
    hora: '',
    precio_max: null,
    ubicacion: '',
    modalidad: '',
    nivel: '',
    calificacion_min: 0,
    ordenarPor: 'calificacion'
  };

  // Opciones para selects
  deportesDisponibles = [
    'Yoga', 'CrossFit', 'Running', 'Pilates', 'Natación', 
    'Ciclismo', 'Boxeo', 'Funcional', 'Spinning', 'Zumba'
  ];

  modalidadesDisponibles = [
    { value: '', label: 'Todas' },
    { value: 'Presencial', label: 'Presencial' },
    { value: 'Online', label: 'Online' }
  ];

  nivelesDisponibles = [
    { value: '', label: 'Todos' },
    { value: 'PRINCIPIANTE', label: 'Principiante' },
    { value: 'INTERMEDIO', label: 'Intermedio' },
    { value: 'AVANZADO', label: 'Avanzado' }
  ];

  ordenarOpciones = [
    { value: 'calificacion', label: 'Mayor calificación' },
    { value: 'precio_asc', label: 'Menor precio' },
    { value: 'precio_desc', label: 'Mayor precio' },
    { value: 'experiencia', label: 'Más experiencia' }
  ];

  // Entrenadores (datos mock)
  entrenadores: Entrenador[] = [
    {
      id: 1,
      nombre_completo: 'Ana Pérez García',
      foto_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
      especialidad: 'Yoga & Pilates',
      deportes: ['Yoga', 'Pilates'],
      calificacion: 4.8,
      total_resenas: 45,
      tarifa_por_hora: 30,
      ubicacion: 'Madrid Centro',
      experiencia: 5,
      nivel: 'AVANZADO',
      modalidad: ['Presencial', 'Online'],
      disponibilidad: 'Lun-Vie: 8:00-20:00',
      certificado: true,
      idiomas: ['Español', 'Inglés']
    },
    {
      id: 2,
      nombre_completo: 'Carlos Ruiz López',
      foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
      especialidad: 'CrossFit & Funcional',
      deportes: ['CrossFit', 'Funcional'],
      calificacion: 4.9,
      total_resenas: 67,
      tarifa_por_hora: 35,
      ubicacion: 'Barcelona',
      experiencia: 8,
      nivel: 'AVANZADO',
      modalidad: ['Presencial'],
      disponibilidad: 'Lun-Sáb: 6:00-22:00',
      certificado: true,
      idiomas: ['Español', 'Catalán', 'Inglés']
    },
    {
      id: 3,
      nombre_completo: 'María González',
      foto_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
      especialidad: 'Running & Atletismo',
      deportes: ['Running', 'Atletismo'],
      calificacion: 4.7,
      total_resenas: 32,
      tarifa_por_hora: 25,
      ubicacion: 'Valencia',
      experiencia: 4,
      nivel: 'INTERMEDIO',
      modalidad: ['Presencial', 'Online'],
      disponibilidad: 'Mar-Dom: 7:00-19:00',
      certificado: true,
      idiomas: ['Español']
    },
    {
      id: 4,
      nombre_completo: 'David Martínez',
      foto_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
      especialidad: 'Boxeo & Artes Marciales',
      deportes: ['Boxeo', 'Kickboxing'],
      calificacion: 4.9,
      total_resenas: 58,
      tarifa_por_hora: 40,
      ubicacion: 'Madrid Norte',
      experiencia: 10,
      nivel: 'AVANZADO',
      modalidad: ['Presencial'],
      disponibilidad: 'Lun-Vie: 16:00-22:00',
      certificado: true,
      idiomas: ['Español', 'Inglés']
    },
    {
      id: 5,
      nombre_completo: 'Laura Sánchez',
      foto_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
      especialidad: 'Natación',
      deportes: ['Natación'],
      calificacion: 4.6,
      total_resenas: 28,
      tarifa_por_hora: 28,
      ubicacion: 'Sevilla',
      experiencia: 6,
      nivel: 'INTERMEDIO',
      modalidad: ['Presencial'],
      disponibilidad: 'Lun-Sáb: 8:00-14:00',
      certificado: true,
      idiomas: ['Español']
    },
    {
      id: 6,
      nombre_completo: 'Javier Torres',
      foto_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
      especialidad: 'Ciclismo & Spinning',
      deportes: ['Ciclismo', 'Spinning'],
      calificacion: 4.8,
      total_resenas: 41,
      tarifa_por_hora: 32,
      ubicacion: 'Bilbao',
      experiencia: 7,
      nivel: 'AVANZADO',
      modalidad: ['Presencial', 'Online'],
      disponibilidad: 'Todos los días: 6:00-21:00',
      certificado: true,
      idiomas: ['Español', 'Euskera']
    }
  ];

  entrenadoresFiltrados: Entrenador[] = [];
  cargando = false;
  mostrarFiltros = true;

  constructor(private dialogService: NbDialogService) {}

  ngOnInit(): void {
    this.entrenadoresFiltrados = [...this.entrenadores];
  }

  aplicarFiltros(): void {
    this.cargando = true;
    
    setTimeout(() => {
      this.entrenadoresFiltrados = this.entrenadores.filter(e => {
        // Filtro por deporte
        if (this.filtros.deporte && !e.deportes.some(d => 
          d.toLowerCase().includes(this.filtros.deporte.toLowerCase())
        )) {
          return false;
        }

        // Filtro por precio máximo
        if (this.filtros.precio_max && e.tarifa_por_hora > this.filtros.precio_max) {
          return false;
        }

        // Filtro por ubicación
        if (this.filtros.ubicacion && !e.ubicacion.toLowerCase().includes(
          this.filtros.ubicacion.toLowerCase()
        )) {
          return false;
        }

        // Filtro por modalidad
        if (this.filtros.modalidad && !e.modalidad.includes(this.filtros.modalidad)) {
          return false;
        }

        // Filtro por nivel
        if (this.filtros.nivel && e.nivel !== this.filtros.nivel) {
          return false;
        }

        // Filtro por calificación mínima
        if (this.filtros.calificacion_min && e.calificacion < this.filtros.calificacion_min) {
          return false;
        }

        return true;
      });

      // Ordenar resultados
      this.ordenarResultados();

      this.cargando = false;
    }, 500); // Simula llamada API
  }

  ordenarResultados(): void {
    switch (this.filtros.ordenarPor) {
      case 'calificacion':
        this.entrenadoresFiltrados.sort((a, b) => b.calificacion - a.calificacion);
        break;
      case 'precio_asc':
        this.entrenadoresFiltrados.sort((a, b) => a.tarifa_por_hora - b.tarifa_por_hora);
        break;
      case 'precio_desc':
        this.entrenadoresFiltrados.sort((a, b) => b.tarifa_por_hora - a.tarifa_por_hora);
        break;
      case 'experiencia':
        this.entrenadoresFiltrados.sort((a, b) => b.experiencia - a.experiencia);
        break;
    }
  }

  limpiarFiltros(): void {
    this.filtros = {
      deporte: '',
      fecha: '',
      hora: '',
      precio_max: null,
      ubicacion: '',
      modalidad: '',
      nivel: '',
      calificacion_min: 0,
      ordenarPor: 'calificacion'
    };
    this.aplicarFiltros();
  }

  verDisponibilidad(entrenador: Entrenador): void {
    console.log('Ver disponibilidad de:', entrenador);
    // TODO: Abrir modal con calendario de disponibilidad
  }

  agendarSesion(entrenador: Entrenador): void {
    console.log('Agendar sesión con:', entrenador);
    // TODO: Navegar a agendar-sesion con el ID del entrenador
  }

  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  getEstrellas(calificacion: number): number[] {
    return Array(Math.floor(calificacion)).fill(0);
  }

  getEstrellasVacias(calificacion: number): number[] {
    return Array(5 - Math.floor(calificacion)).fill(0);
  }
}
