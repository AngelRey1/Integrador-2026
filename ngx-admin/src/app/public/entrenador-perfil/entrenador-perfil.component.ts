import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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

@Component({
  selector: 'app-entrenador-perfil',
  templateUrl: './entrenador-perfil.component.html',
  styleUrls: ['./entrenador-perfil.component.scss']
})
export class EntrenadorPerfilComponent implements OnInit {
  entrenadorId: number;
  
  entrenador = {
    id: 1,
    nombre: 'Carlos Méndez',
    foto: 'https://i.pravatar.cc/600?img=12',
    ubicacion: 'Ciudad de México',
    especialidad: 'CrossFit',
    deportes: ['CrossFit', 'Funcional', 'Fuerza'],
    calificacion: 5,
    totalResenas: 89,
    precioHora: 35,
    destacado: true,
    nivel: 'ELITE',
    modalidad: ['Presencial', 'Online'],
    experiencia: 10,
    certificaciones: [
      'CrossFit Level 3 Trainer',
      'Certified Strength & Conditioning Specialist',
      'Nutrition Coach Certification'
    ],
    bio: 'Entrenador certificado con más de 10 años de experiencia ayudando a personas a alcanzar sus objetivos de fitness. Especializado en CrossFit, entrenamiento funcional y desarrollo de fuerza. Mi enfoque se basa en técnicas probadas y adaptadas a cada persona.',
    logros: [
      'Entrenador de atletas olímpicos',
      '+ 500 clientes satisfechos',
      'Instructor certificado internacional'
    ],
    whatsapp: '+5215512345678',
    email: 'carlos.mendez@sportconnect.com',
    idiomas: ['Español', 'Inglés'],
    fotos: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800'
    ]
  };

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

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.entrenadorId = +params['id'];
      // Aquí cargarías los datos del entrenador desde un servicio
    });
  }

  getEstrellas(calificacion: number): string[] {
    const estrellas = [];
    for (let i = 0; i < 5; i++) {
      estrellas.push(i < Math.floor(calificacion) ? 'full' : 'empty');
    }
    return estrellas;
  }

  contactarWhatsApp() {
    const mensaje = encodeURIComponent(
      `Hola ${this.entrenador.nombre}, vi tu perfil en SportConnect y me gustaría reservar una sesión de ${this.entrenador.especialidad}.`
    );
    window.open(`https://wa.me/${this.entrenador.whatsapp}?text=${mensaje}`, '_blank');
  }

  cambiarTab(tab: string) {
    this.tabActiva = tab;
  }

  compartirPerfil() {
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
}
