import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { AdminFirebaseService, DashboardStats, Entrenador, Pago } from '../../../core/services/admin-firebase.service';
import { Subscription } from 'rxjs';

interface PendingTrainer {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  requestDate: Date;
  email: string;
}

interface Transaction {
  id: string;
  type: 'payment' | 'commission';
  description: string;
  user: string;
  amount: number;
  date: Date;
}

@Component({
  selector: 'sc-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  today = new Date();
  loading = true;
  isAdmin = false;
  noAdminExists = false;
  checkingAdmin = true;

  stats = {
    totalUsers: 0,
    activeTrainers: 0,
    totalReservations: 0,
    monthlyRevenue: 0,
    todayTransactions: 0,
    activeSports: 0,
    conversionRate: 0,
    avgSatisfaction: 0,
    retentionRate: 0
  };

  pendingTrainers: PendingTrainer[] = [];
  recentTransactions: Transaction[] = [];
  reports: any[] = [];

  // Subscription KPIs
  planFreeCount = 0;
  planProCount = 0;
  planAnualCount = 0;
  suscripcionesPendientes = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private toastr: NbToastrService,
    private adminFirebase: AdminFirebaseService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.verificarAdmin();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  async verificarAdmin(): Promise<void> {
    this.checkingAdmin = true;
    try {
      // Verificar si el usuario actual es admin
      this.isAdmin = await this.adminFirebase.isCurrentUserAdmin();
      
      if (!this.isAdmin) {
        // Verificar si hay algún admin
        const hayAdmin = await this.adminFirebase.hasAnyAdmin();
        this.noAdminExists = !hayAdmin;
      }

      if (this.isAdmin) {
        this.cargarDatos();
      }
    } catch (error) {
      console.error('Error verificando admin:', error);
      this.noAdminExists = true;
    }
    this.checkingAdmin = false;
  }

  async registrarseComoAdmin(): Promise<void> {
    try {
      await this.adminFirebase.registerAsAdmin();
      this.toastr.success('Te has registrado como administrador', 'Éxito');
      this.isAdmin = true;
      this.noAdminExists = false;
      this.cargarDatos();
    } catch (error: any) {
      console.error('Error registrándose como admin:', error);
      this.toastr.danger('Error al registrarse como admin: ' + error.message, 'Error');
    }
  }

  cargarDatos(): void {
    this.loading = true;

    // Cargar estadísticas del dashboard
    const statsSub = this.adminFirebase.getDashboardStats().subscribe(stats => {
      this.stats.totalUsers = stats.totalUsuarios;
      this.stats.activeTrainers = stats.totalEntrenadores;
      this.stats.totalReservations = stats.totalReservas;
      this.stats.monthlyRevenue = stats.ingresosMes;
      this.stats.todayTransactions = stats.reservasHoy;
      this.loading = false;
    });
    this.subscriptions.push(statsSub);

    // Cargar entrenadores pendientes de verificación
    const trainersSub = this.adminFirebase.getEntrenadores().subscribe(entrenadores => {
      this.pendingTrainers = entrenadores
        .filter(e => !e.verificado)
        .slice(0, 5)
        .map(e => ({
          id: e.id || '',
          name: `${e.nombre} ${e.apellidoPaterno}`,
          specialty: e.deportes?.join(', ') || 'General',
          avatar: e.foto || '',
          requestDate: this.convertirFecha(e.fechaRegistro),
          email: ''
        }));
    });
    this.subscriptions.push(trainersSub);

    // Cargar transacciones recientes
    const pagosSub = this.adminFirebase.getPagos().subscribe(pagos => {
      this.recentTransactions = pagos.slice(0, 5).map(p => ({
        id: p.id || '',
        type: 'payment' as const,
        description: 'Sesión de entrenamiento',
        user: p.clienteId,
        amount: p.monto,
        date: this.convertirFecha(p.fecha)
      }));
    });
    this.subscriptions.push(pagosSub);

    // Cargar deportes activos
    const deportesSub = this.adminFirebase.getDeportes().subscribe(deportes => {
      this.stats.activeSports = deportes.filter(d => d.activo).length;
    });
    this.subscriptions.push(deportesSub);

    // KPIs de suscripciones - conteo por plan
    const susPlansSub = this.adminFirebase.getEntrenadores().subscribe(entrenadores => {
      this.planFreeCount  = entrenadores.filter(e => !e.planSuscripcion || e.planSuscripcion === 'free').length;
      this.planProCount   = entrenadores.filter(e => e.planSuscripcion === 'pro').length;
      this.planAnualCount = entrenadores.filter(e => e.planSuscripcion === 'anual').length;
    });
    this.subscriptions.push(susPlansSub);

    // Pagos de suscripción pendientes de validación
    const susPendSub = this.adminFirebase.getPagosSuscripcion('pendiente').subscribe(pagos => {
      this.suscripcionesPendientes = pagos.length;
    });
    this.subscriptions.push(susPendSub);
  }

  private convertirFecha(fecha: any): Date {
    if (fecha instanceof Date) return fecha;
    if (fecha?.seconds) return new Date(fecha.seconds * 1000);
    return new Date();
  }

  async approveTrainer(trainer: PendingTrainer): Promise<void> {
    const result = await this.adminFirebase.verificarEntrenador(trainer.id);
    if (result.success) {
      this.toastr.success(
        `El entrenador ${trainer.name} ha sido aprobado exitosamente`,
        'Entrenador Aprobado',
        { duration: 4000 }
      );
    } else {
      this.toastr.danger(result.message, 'Error');
    }
  }

  async rejectTrainer(trainer: PendingTrainer): Promise<void> {
    const result = await this.adminFirebase.desactivarEntrenador(trainer.id);
    if (result.success) {
      this.toastr.warning(
        `La solicitud de ${trainer.name} ha sido rechazada`,
        'Solicitud Rechazada',
        { duration: 4000 }
      );
    } else {
      this.toastr.danger(result.message, 'Error');
    }
  }

  viewTrainerProfile(trainer: PendingTrainer): void {
    this.router.navigate(['/admin/entrenadores', trainer.id]);
  }

  viewReport(report: any): void {
    this.router.navigate(['/admin/reportes/denuncias', report.id]);
  }

  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(monto);
  }

  formatCurrency(monto: number): string {
    return this.formatearMoneda(monto);
  }
}

