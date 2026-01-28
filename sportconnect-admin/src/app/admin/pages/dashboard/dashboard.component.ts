import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';

interface PendingTrainer {
  id: number;
  name: string;
  specialty: string;
  avatar: string;
  requestDate: Date;
  email: string;
}

interface Transaction {
  id: number;
  type: 'payment' | 'commission';
  description: string;
  user: string;
  amount: number;
  date: Date;
}

interface Report {
  id: number;
  title: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
  date: Date;
}

@Component({
  selector: 'sc-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  today = new Date();

  stats = {
    totalUsers: 1248,
    activeTrainers: 87,
    totalReservations: 342,
    monthlyRevenue: 156750,
    todayTransactions: 23,
    activeSports: 15,
    conversionRate: 68,
    avgSatisfaction: 4.7,
    retentionRate: 82
  };

  pendingTrainers: PendingTrainer[] = [
    {
      id: 1,
      name: 'Carlos Mendoza',
      specialty: 'Entrenamiento Funcional',
      avatar: '',
      requestDate: new Date('2026-01-10'),
      email: 'carlos.mendoza@email.com'
    },
    {
      id: 2,
      name: 'María González',
      specialty: 'Yoga y Pilates',
      avatar: '',
      requestDate: new Date('2026-01-11'),
      email: 'maria.gonzalez@email.com'
    },
    {
      id: 3,
      name: 'Roberto Sánchez',
      specialty: 'CrossFit',
      avatar: '',
      requestDate: new Date('2026-01-12'),
      email: 'roberto.sanchez@email.com'
    },
    {
      id: 4,
      name: 'Ana Martínez',
      specialty: 'Natación',
      avatar: '',
      requestDate: new Date('2026-01-12'),
      email: 'ana.martinez@email.com'
    },
    {
      id: 5,
      name: 'Luis Hernández',
      specialty: 'Boxeo',
      avatar: '',
      requestDate: new Date('2026-01-13'),
      email: 'luis.hernandez@email.com'
    }
  ];

  recentTransactions: Transaction[] = [
    {
      id: 1,
      type: 'payment',
      description: 'Sesión de Yoga',
      user: 'Juan Pérez',
      amount: 350,
      date: new Date()
    },
    {
      id: 2,
      type: 'commission',
      description: 'Comisión plataforma',
      user: 'María González',
      amount: 52.50,
      date: new Date()
    },
    {
      id: 3,
      type: 'payment',
      description: 'Pack 5 sesiones CrossFit',
      user: 'Laura Ruiz',
      amount: 1500,
      date: new Date()
    },
    {
      id: 4,
      type: 'payment',
      description: 'Entrenamiento Personal',
      user: 'Carlos Vega',
      amount: 450,
      date: new Date()
    },
    {
      id: 5,
      type: 'commission',
      description: 'Comisión plataforma',
      user: 'Roberto Sánchez',
      amount: 67.50,
      date: new Date()
    }
  ];

  reports: Report[] = [
    {
      id: 1,
      title: 'Usuario reportado por comportamiento inadecuado',
      type: 'Denuncia Usuario',
      priority: 'high',
      date: new Date('2026-01-12')
    },
    {
      id: 2,
      title: 'Entrenador no cumplió con la sesión',
      type: 'Queja Servicio',
      priority: 'medium',
      date: new Date('2026-01-11')
    }
  ];

  constructor(
    private router: Router,
    private toastr: NbToastrService
  ) {}

  ngOnInit(): void {
    // Aquí cargaríamos datos reales del backend
  }

  approveTrainer(trainer: PendingTrainer): void {
    this.pendingTrainers = this.pendingTrainers.filter(t => t.id !== trainer.id);
    this.toastr.success(
      `El entrenador ${trainer.name} ha sido aprobado exitosamente`,
      'Entrenador Aprobado',
      { duration: 4000 }
    );
    this.stats.activeTrainers++;
  }

  rejectTrainer(trainer: PendingTrainer): void {
    this.pendingTrainers = this.pendingTrainers.filter(t => t.id !== trainer.id);
    this.toastr.warning(
      `La solicitud de ${trainer.name} ha sido rechazada`,
      'Solicitud Rechazada',
      { duration: 4000 }
    );
  }

  viewTrainerProfile(trainer: PendingTrainer): void {
    // En producción navegaría al perfil detallado
    this.toastr.info(
      `Viendo perfil de ${trainer.name}`,
      'Perfil del Entrenador'
    );
  }

  viewReport(report: Report): void {
    this.router.navigate(['/admin/reportes/denuncias', report.id]);
  }
}
