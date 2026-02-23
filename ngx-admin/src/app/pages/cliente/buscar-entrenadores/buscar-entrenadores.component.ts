import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NbDialogService } from '@nebular/theme';
import { ClienteFirebaseService, Entrenador as EntrenadorFirebase } from '../../../@core/services/cliente-firebase.service';
import { Subscription } from 'rxjs';

interface Entrenador {
  id: string;
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
export class BuscarEntrenadoresComponent implements OnInit, OnDestroy {
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
    'Fútbol', 'Básquetbol', 'Basketball', 'Tenis', 'Natación', 'Running', 
    'Ciclismo', 'Yoga', 'Pilates', 'CrossFit', 'Boxeo', 'Béisbol', 'Softball',
    'Artes Marciales', 'Volleyball', 'Golf', 'Gimnasia',
    'Entrenamiento Funcional', 'Pesas', 'Cardio', 'Fitness General'
  ];

  modalidadesDisponibles = [
    { value: '', label: 'Todas' },
    { value: 'presencial', label: 'Presencial' },
    { value: 'online', label: 'Online' }
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
    { value: 'precio_desc', label: 'Mayor precio' }
  ];

  // Entrenadores desde Firebase
  entrenadores: Entrenador[] = [];
  entrenadoresFiltrados: Entrenador[] = [];
  cargando = true;
  mostrarFiltros = true;

  private subscription: Subscription | null = null;

  constructor(
    private dialogService: NbDialogService,
    private router: Router,
    private clienteFirebase: ClienteFirebaseService
  ) { }

  ngOnInit(): void {
    this.cargarEntrenadores();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  cargarEntrenadores(): void {
    this.cargando = true;
    
    // DEBUG: Mostrar TODOS los entrenadores para diagnóstico
    this.clienteFirebase.getAllEntrenadoresDebug().subscribe();
    
    // Cargar entrenadores filtrados (verificados y activos)
    this.subscription = this.clienteFirebase.getEntrenadores().subscribe(entrenadores => {
      console.log('📊 Total entrenadores para mostrar:', entrenadores.length);
      this.entrenadores = entrenadores.map(e => this.convertirEntrenador(e));
      this.entrenadoresFiltrados = [...this.entrenadores];
      this.ordenarResultados();
      this.cargando = false;
    });
  }

  private convertirEntrenador(e: EntrenadorFirebase): Entrenador {
    return {
      id: e.id || '',
      nombre_completo: `${e.nombre} ${e.apellidoPaterno}`,
      foto_url: e.foto || 'assets/images/avatar-default.png',
      especialidad: e.especialidades?.join(' & ') || e.deportes?.join(' & ') || 'General',
      deportes: e.deportes || [],
      calificacion: e.calificacionPromedio || 0,
      total_resenas: e.totalReviews || 0,
      tarifa_por_hora: e.precio || 0,
      ubicacion: e.ubicacion?.ciudad || e.ubicacion?.direccion || 'No especificada',
      experiencia: 0, // Se puede calcular desde fechaRegistro
      nivel: 'AVANZADO',
      modalidad: e.modalidades || ['presencial'],
      disponibilidad: this.formatearDisponibilidad(e.disponibilidad),
      certificado: e.verificado || false,
      idiomas: ['Español']
    };
  }

  private formatearDisponibilidad(disp: any): string {
    if (!disp) return 'Consultar disponibilidad';
    const dias = Object.keys(disp).filter(d => disp[d]?.length > 0);
    if (dias.length === 0) return 'Sin horarios definidos';
    return `${dias.length} días disponible`;
  }

  aplicarFiltros(): void {
    this.cargando = true;

    // Usar el servicio de Firebase para filtrar
    if (this.filtros.deporte || this.filtros.modalidad || this.filtros.precio_max || this.filtros.ubicacion) {
      this.subscription?.unsubscribe();
      this.subscription = this.clienteFirebase.buscarEntrenadores({
        deporte: this.filtros.deporte || undefined,
        modalidad: this.filtros.modalidad || undefined,
        precioMax: this.filtros.precio_max || undefined,
        ciudad: this.filtros.ubicacion || undefined
      }).subscribe(entrenadores => {
        this.entrenadoresFiltrados = entrenadores
          .map(e => this.convertirEntrenador(e))
          .filter(e => {
            // Filtros adicionales del lado del cliente
            if (this.filtros.calificacion_min && e.calificacion < this.filtros.calificacion_min) {
              return false;
            }
            return true;
          });
        this.ordenarResultados();
        this.cargando = false;
      });
    } else {
      // Sin filtros específicos - usar lista completa
      this.entrenadoresFiltrados = this.entrenadores.filter(e => {
        if (this.filtros.calificacion_min && e.calificacion < this.filtros.calificacion_min) {
          return false;
        }
        return true;
      });
      this.ordenarResultados();
      this.cargando = false;
    }
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
    this.cargarEntrenadores();
  }

  verDisponibilidad(entrenador: Entrenador): void {
    // Navegar a agendar sesión para ver disponibilidad
    this.router.navigate(['/pages/cliente/agendar-sesion'], {
      queryParams: { entrenador: entrenador.id, modo: 'disponibilidad' }
    });
  }

  agendarSesion(entrenador: Entrenador): void {
    this.router.navigate(['/pages/cliente/agendar-sesion'], {
      queryParams: { entrenador: entrenador.id }
    });
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

