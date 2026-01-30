import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

interface Deporte {
  nombre: string;
  icon: string;
  slug: string;
  entrenadores: number;
}

interface EntrenadorDestacado {
  id: number;
  nombre: string;
  deporte: string;
  foto: string;
  estrellas: number;
  reviews: number;
  precio: number;
  verificado: boolean;
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
    { nombre: 'Fútbol', icon: 'futbol', slug: 'futbol', entrenadores: 152 },
    { nombre: 'CrossFit', icon: 'crossfit', slug: 'crossfit', entrenadores: 98 },
    { nombre: 'Yoga', icon: 'yoga', slug: 'yoga', entrenadores: 124 },
    { nombre: 'Natación', icon: 'natacion', slug: 'natacion', entrenadores: 76 },
    { nombre: 'Running', icon: 'running', slug: 'running', entrenadores: 89 },
    { nombre: 'Boxeo', icon: 'boxeo', slug: 'boxeo', entrenadores: 65 },
    { nombre: 'Ciclismo', icon: 'ciclismo', slug: 'ciclismo', entrenadores: 54 },
    { nombre: 'Tenis', icon: 'tenis', slug: 'tenis', entrenadores: 43 },
    { nombre: 'Béisbol', icon: 'beisbol', slug: 'beisbol', entrenadores: 38 },
    { nombre: 'Basketball', icon: 'basketball', slug: 'basketball', entrenadores: 67 },
    { nombre: 'Softball', icon: 'softball', slug: 'softball', entrenadores: 29 },
  ];

  imagenesAccion = [
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop', // Crossfit mujer
    'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=400&h=400&fit=crop', // Corredor
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop', // Entrenador gym
    'https://images.unsplash.com/photo-1549476464-37392f717541?w=400&h=400&fit=crop', // Yoga salto
    'https://images.unsplash.com/photo-1434608519344-49d77a699ded?w=400&h=400&fit=crop'  // Outdoor training
  ];

  avatarsFlotantes = [
    { id: 1, top: '5%', left: '8%', delay: '0s', imgIndex: 0 },
    { id: 2, top: '15%', right: '12%', delay: '1s', imgIndex: 1 },
    { id: 3, top: '60%', left: '5%', delay: '2s', imgIndex: 2 },
    { id: 4, top: '70%', right: '8%', delay: '1.5s', imgIndex: 3 },
  ];

  entrenadoresDestacados: EntrenadorDestacado[] = [
    {
      id: 1,
      nombre: 'Carlos Méndez',
      deporte: 'Fútbol',
      foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      estrellas: 4.9,
      reviews: 127,
      precio: 350,
      verificado: true
    },
    {
      id: 2,
      nombre: 'Ana García',
      deporte: 'Yoga',
      foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      estrellas: 4.95,
      reviews: 89,
      precio: 280,
      verificado: true
    },
    {
      id: 3,
      nombre: 'Jorge Sánchez',
      deporte: 'CrossFit',
      foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      estrellas: 4.8,
      reviews: 156,
      precio: 420,
      verificado: true
    },
    {
      id: 4,
      nombre: 'María López',
      deporte: 'Running',
      foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      estrellas: 4.92,
      reviews: 103,
      precio: 300,
      verificado: true
    },
    {
      id: 5,
      nombre: 'Roberto Hernández',
      deporte: 'Boxeo',
      foto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
      estrellas: 4.88,
      reviews: 142,
      precio: 380,
      verificado: true
    },
    {
      id: 6,
      nombre: 'Laura Martínez',
      deporte: 'Natación',
      foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
      estrellas: 4.93,
      reviews: 98,
      precio: 320,
      verificado: true
    },
    {
      id: 7,
      nombre: 'Diego Ramírez',
      deporte: 'Tenis',
      foto: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop',
      estrellas: 4.87,
      reviews: 76,
      precio: 400,
      verificado: true
    },
    {
      id: 8,
      nombre: 'Sofia Torres',
      deporte: 'Pilates',
      foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
      estrellas: 4.91,
      reviews: 112,
      precio: 290,
      verificado: true
    },
    {
      id: 9,
      nombre: 'Luis Fernández',
      deporte: 'Ciclismo',
      foto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
      estrellas: 4.85,
      reviews: 134,
      precio: 340,
      verificado: true
    },
    {
      id: 10,
      nombre: 'Valeria Rojas',
      deporte: 'Zumba',
      foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
      estrellas: 4.94,
      reviews: 187,
      precio: 250,
      verificado: true
    },
    {
      id: 11,
      nombre: 'Eduardo Morales',
      deporte: 'Functional Training',
      foto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
      estrellas: 4.89,
      reviews: 121,
      precio: 370,
      verificado: true
    },
    {
      id: 12,
      nombre: 'Patricia Silva',
      deporte: 'Spinning',
      foto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop',
      estrellas: 4.86,
      reviews: 95,
      precio: 310,
      verificado: true
    },
    {
      id: 13,
      nombre: 'Andrés Castillo',
      deporte: 'Artes Marciales',
      foto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
      estrellas: 4.9,
      reviews: 108,
      precio: 390,
      verificado: true
    },
    {
      id: 14,
      nombre: 'Camila Reyes',
      deporte: 'Ballet Fitness',
      foto: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop',
      estrellas: 4.92,
      reviews: 84,
      precio: 330,
      verificado: true
    },
    {
      id: 15,
      nombre: 'Miguel Ángel Ortiz',
      deporte: 'Calistenia',
      foto: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop',
      estrellas: 4.88,
      reviews: 147,
      precio: 280,
      verificado: true
    }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Aleatorizar el orden de deportes al iniciar (para que sea diferente cada vez)
    this.deportes = this.shuffleArray([...this.deportes]);

    // Iniciar con las primeras 5 categorías
    this.actualizarDeportesVisibles();

    // Rotar categorías cada 20 segundos
    this.carouselInterval = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.deportes.length;
      this.actualizarDeportesVisibles();
    }, 20000);
  }

  ngOnDestroy(): void {
    // Limpiar interval al destruir el componente
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
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
