import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Sesion {
  id: number;
  cliente: {
    nombre: string;
    avatar: string;
  };
  deporte: string;
  fecha: Date;
  hora: string;
  duracion: number;
  modalidad: 'presencial' | 'online';
  estado: 'CONFIRMADA' | 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA';
  ubicacion?: string;
}

interface Estadistica {
  mes: string;
  sesiones: number;
  ingresos: number;
}

@Component({
  selector: 'ngx-entrenador-dashboard',
  templateUrl: './entrenador-dashboard.component.html',
  styleUrls: ['./entrenador-dashboard.component.scss']
})
export class EntrenadorDashboardComponent implements OnInit {
  // Métricas principales
  clientesActivos = 24;
  sesionesMes = 42;
  ingresosMes = 1890;
  ingresosSemanales = 450;
  calificacionPromedio = 4.8;
  tasaAsistencia = 94;
  totalResenas = 127;

  // Próximas sesiones
  proximasSesiones: Sesion[] = [];
  
  // Sesiones de hoy
  sesionesHoy: Sesion[] = [];

  // Últimos clientes
  ultimosClientes: any[] = [];

  // Estadísticas mensuales
  estadisticasMensuales: Estadistica[] = [
    { mes: 'Ago', sesiones: 38, ingresos: 1710 },
    { mes: 'Sep', sesiones: 41, ingresos: 1845 },
    { mes: 'Oct', sesiones: 45, ingresos: 2025 },
    { mes: 'Nov', sesiones: 42, ingresos: 1890 }
  ];

  // Notificaciones
  notificacionesPendientes = 3;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    const ahora = new Date();
    
    // Mock data clientes
    this.ultimosClientes = [
      { nombre: 'María González', foto: 'https://i.pravatar.cc/150?img=5', sesiones: 12 },
      { nombre: 'Carlos Mendez', foto: 'https://i.pravatar.cc/150?img=6', sesiones: 8 },
      { nombre: 'Ana López', foto: 'https://i.pravatar.cc/150?img=7', sesiones: 5 },
      { nombre: 'Juan Pérez', foto: 'https://i.pravatar.cc/150?img=8', sesiones: 3 }
    ];
    
    // Mock data sesiones
    const todasSesiones: Sesion[] = [
      {
        id: 1,
        cliente: {
          nombre: 'María González',
          avatar: 'https://i.pravatar.cc/150?img=5'
        },
        deporte: 'Yoga',
        fecha: new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 9, 0),
        hora: '09:00',
        duracion: 60,
        modalidad: 'presencial',
        estado: 'CONFIRMADA',
        ubicacion: 'Estudio Central'
      },
      {
        id: 2,
        cliente: {
          nombre: 'Carlos Ruiz',
          avatar: 'https://i.pravatar.cc/150?img=12'
        },
        deporte: 'CrossFit',
        fecha: new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 11, 0),
        hora: '11:00',
        duracion: 90,
        modalidad: 'presencial',
        estado: 'CONFIRMADA',
        ubicacion: 'Box Principal'
      },
      {
        id: 3,
        cliente: {
          nombre: 'Ana Pérez',
          avatar: 'https://i.pravatar.cc/150?img=1'
        },
        deporte: 'Pilates',
        fecha: new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 16, 0),
        hora: '16:00',
        duracion: 60,
        modalidad: 'online',
        estado: 'CONFIRMADA'
      },
      {
        id: 4,
        cliente: {
          nombre: 'David Martínez',
          avatar: 'https://i.pravatar.cc/150?img=8'
        },
        deporte: 'Yoga',
        fecha: new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1, 10, 0),
        hora: '10:00',
        duracion: 60,
        modalidad: 'presencial',
        estado: 'CONFIRMADA',
        ubicacion: 'Estudio Central'
      },
      {
        id: 5,
        cliente: {
          nombre: 'Laura Sánchez',
          avatar: 'https://i.pravatar.cc/150?img=20'
        },
        deporte: 'Yoga',
        fecha: new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1, 18, 0),
        hora: '18:00',
        duracion: 60,
        modalidad: 'online',
        estado: 'PENDIENTE'
      },
      {
        id: 6,
        cliente: {
          nombre: 'Javier Torres',
          avatar: 'https://i.pravatar.cc/150?img=13'
        },
        deporte: 'Pilates',
        fecha: new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 2, 9, 0),
        hora: '09:00',
        duracion: 60,
        modalidad: 'presencial',
        estado: 'CONFIRMADA',
        ubicacion: 'Estudio 2'
      }
    ];

    // Filtrar sesiones de hoy
    this.sesionesHoy = todasSesiones.filter(s => {
      const fechaSesion = new Date(s.fecha);
      return fechaSesion.getDate() === ahora.getDate() &&
             fechaSesion.getMonth() === ahora.getMonth() &&
             fechaSesion.getFullYear() === ahora.getFullYear();
    });

    // Próximas 6 sesiones
    this.proximasSesiones = todasSesiones
      .filter(s => s.fecha >= ahora)
      .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
      .slice(0, 6);
  }

  verCliente(sesion: Sesion): void {
    console.log('Ver cliente:', sesion.cliente.nombre);
    this.router.navigate(['/pages/entrenador/mis-clientes']);
  }

  irACalendario(): void {
    this.router.navigate(['/pages/entrenador/calendario']);
  }

  irAClases(): void {
    this.router.navigate(['/pages/entrenador/gestion-clases']);
  }

  irAIngresos(): void {
    this.router.navigate(['/pages/entrenador/mis-ingresos']);
  }

  getEstadoBadgeStatus(estado: string): string {
    const statusMap: Record<string, string> = {
      'CONFIRMADA': 'success',
      'PENDIENTE': 'warning',
      'COMPLETADA': 'info',
      'CANCELADA': 'danger'
    };
    return statusMap[estado] || 'basic';
  }

  formatearFecha(fecha: Date): string {
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);

    if (fecha.getDate() === hoy.getDate() && 
        fecha.getMonth() === hoy.getMonth() && 
        fecha.getFullYear() === hoy.getFullYear()) {
      return 'Hoy';
    }
    
    if (fecha.getDate() === manana.getDate() && 
        fecha.getMonth() === manana.getMonth() && 
        fecha.getFullYear() === manana.getFullYear()) {
      return 'Mañana';
    }

    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short'
    }).format(fecha);
  }

  getMaxEstadistica(tipo: 'sesiones' | 'ingresos'): number {
    return Math.max(...this.estadisticasMensuales.map(e => tipo === 'sesiones' ? e.sesiones : e.ingresos));
  }

  getBarHeight(valor: number, tipo: 'sesiones' | 'ingresos'): number {
    const max = this.getMaxEstadistica(tipo);
    return (valor / max) * 100;
  }

  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(monto);
  }
}
