import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ClienteFirebaseService, Entrenador as EntrenadorFirebase } from '../../@core/services/cliente-firebase.service';

interface Deporte {
  nombre: string;
  icon: string;
  slug: string;
  entrenadores: number;
}

interface EntrenadorDestacado {
  id: string;
  nombre: string;
  deporte: string;
  foto: string;
  estrellas: number;
  reviews: number;
  precio: number;
  verificado: boolean;
  experiencia?: number;
  lat?: number;
  lng?: number;
  distancia?: number;
}

@Component({
  selector: 'ngx-public-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class PublicHomeComponent implements OnInit, OnDestroy {
  searchQuery = '';
  deportesVisibles: Deporte[] = [];
  private carouselInterval: any;
  private currentIndex = 0;
  private subscription: Subscription;
  loadingEntrenadores = true;

  // Variables para estadísticas dinámicas
  totalCoaches: number = 0;
  totalSesiones: number = 0;
  calificacionPromedio: number = 4.9;
  
  // Variables de Geolocalización
  userUbicacion: { lat: number; lng: number } | null = null;
  ubicacionActiva: boolean = false;

  pasosEntrenador = [
    {
      numero: '1',
      titulo: 'Publica tu perfil',
      descripcion: 'Elige disciplinas, zona de cobertura y agrega tu portafolio.'
    },
    {
      numero: '2',
      titulo: 'Recibe clientes verificados',
      descripcion: 'Te llegan solicitudes filtradas con pago seguro y chat directo.'
    },
    {
      numero: '3',
      titulo: 'Cobra sin fricción',
      descripcion: 'Define tus tarifas y cobra con respaldo, sin comisiones ocultas.'
    }
  ];

  deportes: Deporte[] = [
    { nombre: 'Fútbol', icon: 'futbol', slug: 'futbol', entrenadores: 0 },
    { nombre: 'CrossFit', icon: 'crossfit', slug: 'crossfit', entrenadores: 0 },
    { nombre: 'Yoga', icon: 'yoga', slug: 'yoga', entrenadores: 0 },
    { nombre: 'Natación', icon: 'natacion', slug: 'natacion', entrenadores: 0 },
    { nombre: 'Running', icon: 'running', slug: 'running', entrenadores: 0 },
    { nombre: 'Boxeo', icon: 'boxeo', slug: 'boxeo', entrenadores: 0 },
    { nombre: 'Ciclismo', icon: 'ciclismo', slug: 'ciclismo', entrenadores: 0 },
    { nombre: 'Tenis', icon: 'tenis', slug: 'tenis', entrenadores: 0 },
    { nombre: 'Béisbol', icon: 'beisbol', slug: 'beisbol', entrenadores: 0 },
    { nombre: 'Basketball', icon: 'basketball', slug: 'basketball', entrenadores: 0 },
    { nombre: 'Softball', icon: 'softball', slug: 'softball', entrenadores: 0 },
  ];

  imagenesAccion = [
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop', // Crossfit mujer
    'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=400&h=400&fit=crop', // Corredor
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop', // Entrenador gym
    'https://images.unsplash.com/photo-1549476464-37392f717541?w=400&h=400&fit=crop', // Yoga salto
    'https://images.unsplash.com/photo-1434608519344-49d77a699ded?w=400&h=400&fit=crop'  // Outdoor training
  ];

  avatarsFlotantes = [
    { id: '1', top: '5%', left: '8%', delay: '0s', imgIndex: 0 },
    { id: '2', top: '15%', right: '12%', delay: '1s', imgIndex: 1 },
    { id: '3', top: '60%', left: '5%', delay: '2s', imgIndex: 2 },
    { id: '4', top: '70%', right: '8%', delay: '1.5s', imgIndex: 3 },
  ];

  // Array vacío - se carga desde Firebase
  entrenadoresDestacados: EntrenadorDestacado[] = [];

  constructor(
    private router: Router,
    private clienteFirebase: ClienteFirebaseService
  ) { }

  ngOnInit(): void {
    // Habilitar scroll en la landing page (Nebular puede bloquearlo)
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    // Aleatorizar el orden de deportes al iniciar (para que sea diferente cada vez)
    this.deportes = this.shuffleArray([...this.deportes]);

    // Iniciar con las primeras 5 categorías
    this.actualizarDeportesVisibles();

    // Rotar categorías cada 20 segundos
    this.carouselInterval = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.deportes.length;
      this.actualizarDeportesVisibles();
    }, 20000);

    // Obtener Geolocalización del usuario antes de cargar entrenadores
    this.solicitarUbicacion();
  }

  private solicitarUbicacion(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userUbicacion = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.ubicacionActiva = true;
          this.cargarEntrenadoresDestacados(); // Carga y ordena con ubicación
        },
        (error) => {
          console.warn('Ubicación denegada o error:', error);
          this.cargarEntrenadoresDestacados(); // Carga normal si falla
        }
      );
    } else {
      this.cargarEntrenadoresDestacados();
    }
  }

  private cargarEntrenadoresDestacados(): void {
    this.loadingEntrenadores = true;
    this.subscription = this.clienteFirebase.getEntrenadores().subscribe({
      next: (entrenadoresFirebase) => {
        if (entrenadoresFirebase && entrenadoresFirebase.length > 0) {
          // Obtener métricas reales básicas
          this.totalCoaches = entrenadoresFirebase.length;
          this.totalSesiones = this.totalCoaches * /*estimado de sesiones por coach*/ 84; 
          
          const totalRating = entrenadoresFirebase.reduce((sum, e) => sum + (e.calificacionPromedio || 5), 0);
          this.calificacionPromedio = Number((totalRating / this.totalCoaches).toFixed(1));

          // Resetear conteos de entrenadores por disciplina
          this.deportes.forEach(d => d.entrenadores = 0);

          // Calcular conteo real desde la base de datos
          entrenadoresFirebase.forEach(e => {
            if (e.deportes && Array.isArray(e.deportes)) {
              e.deportes.forEach(dep => {
                const depLimpiado = dep.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const deporteEncontrado = this.deportes.find(d => 
                  d.slug === depLimpiado || 
                  d.nombre.toLowerCase() === dep.toLowerCase()
                );
                if (deporteEncontrado) {
                  deporteEncontrado.entrenadores++;
                }
              });
            }
          });

          // Transformar entrenadores
          let transformados = entrenadoresFirebase.map(e => this.transformarEntrenador(e));
          
          // Si tenemos ubicación, calculamos distancia y ordenamos por cercanía
          if (this.userUbicacion && this.ubicacionActiva) {
            transformados = transformados.map(e => {
              if (e.lat && e.lng) {
                e.distancia = this.calcularDistancia(this.userUbicacion!.lat, this.userUbicacion!.lng, e.lat, e.lng);
              } else {
                e.distancia = 9999; // Muy lejos si no tiene coord
              }
              return e;
            }).sort((a, b) => (a.distancia || 9999) - (b.distancia || 9999));
          } else {
            // Si no hay ubicación, ordenar por calificación (default)
            transformados = transformados.sort((a, b) => b.estrellas - a.estrellas);
          }

          this.entrenadoresDestacados = transformados.slice(0, 15); // Máximo 15 destacados
        }
        // Solo datos reales de Firebase
        this.loadingEntrenadores = false;
      },
      error: (err) => {
        console.error('Error cargando entrenadores:', err);
        this.loadingEntrenadores = false;
        // Sin fallback a mockups
        this.entrenadoresDestacados = [];
      }
    });
  }

  // Fórmula de Haversine para calcular distancia en km
  private calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en km
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private transformarEntrenador(e: EntrenadorFirebase): EntrenadorDestacado {
    return {
      id: e.id || '',
      nombre: `${e.nombre} ${e.apellidoPaterno || ''}`.trim(),
      deporte: e.deportes?.[0] || 'Fitness',
      foto: e.foto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(`${e.nombre} ${e.apellidoPaterno || ''}`.trim()) + '&background=00D09C&color=fff&size=100',
      estrellas: e.calificacionPromedio || 5.0,
      reviews: e.totalReviews || 0,
      precio: e.precio || 300,
      verificado: e.verificado,
      experiencia: e.experiencia || 1,
      lat: e.ubicacion?.lat,
      lng: e.ubicacion?.lng
    };
  }

  ngOnDestroy(): void {
    // Limpiar interval al destruir el componente
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  actualizarDeportesVisibles(): void {
    this.deportesVisibles = [];
    for (let i = 0; i < 5; i++) {
      const index = (this.currentIndex + i) % this.deportes.length;
      this.deportesVisibles.push(this.deportes[index]);
    }
  }

  buscarEntrenadores() {
    this.router.navigate(['/entrenadores'], {
      queryParams: { q: this.searchQuery }
    });
  }

  verEntrenadoresPorDeporte(deporte: Deporte) {
    this.router.navigate(['/entrenadores'], {
      queryParams: { deporte: deporte.slug }
    });
  }

  irAlPerfil(entrenador: EntrenadorDestacado) {
    this.router.navigate(['/entrenador', entrenador.id]);
  }

  irAInfoEntrenadores() {
    this.router.navigate(['/coach-join']);
  }

  irAUneteEntrenadores(registrarme = false) {
    this.router.navigate(['/auth/register'], {
      queryParams: {
        role: 'coach',
        action: registrarme ? 'signup' : 'learn-more'
      }
    });
  }
}
