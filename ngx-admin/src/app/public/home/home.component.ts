import { Component, OnInit } from '@angular/core';
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
  selector: 'app-public-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class PublicHomeComponent implements OnInit {
  searchQuery = '';
  
  deportes: Deporte[] = [
    { nombre: 'Fútbol', icon: '⚽', slug: 'futbol', entrenadores: 152 },
    { nombre: 'CrossFit', icon: '🏋️', slug: 'crossfit', entrenadores: 98 },
    { nombre: 'Yoga', icon: '🧘', slug: 'yoga', entrenadores: 124 },
    { nombre: 'Natación', icon: '🏊', slug: 'natacion', entrenadores: 76 },
    { nombre: 'Running', icon: '🏃', slug: 'running', entrenadores: 89 },
    { nombre: 'Boxeo', icon: '🥊', slug: 'boxeo', entrenadores: 65 },
    { nombre: 'Ciclismo', icon: '🚴', slug: 'ciclismo', entrenadores: 54 },
    { nombre: 'Tenis', icon: '🎾', slug: 'tenis', entrenadores: 43 },
  ];

  avatarsFlotantes = [
    { id: 1, top: '5%', left: '8%', delay: '0s' },
    { id: 2, top: '15%', right: '12%', delay: '1s' },
    { id: 3, top: '60%', left: '5%', delay: '2s' },
    { id: 4, top: '70%', right: '8%', delay: '1.5s' },
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
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {}

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
}
