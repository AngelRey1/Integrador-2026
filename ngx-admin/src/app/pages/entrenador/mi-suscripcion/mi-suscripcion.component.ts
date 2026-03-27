import { Component, OnInit, OnDestroy } from '@angular/core';
import { NbToastrService, NbDialogService } from '@nebular/theme';
import { EntrenadorFirebaseService } from '../../../@core/services/entrenador-firebase.service';
import { Subscription } from 'rxjs';
import { PagoSuscripcionDialogComponent } from './pago-suscripcion-dialog/pago-suscripcion-dialog.component';

@Component({
  selector: 'ngx-mi-suscripcion',
  templateUrl: './mi-suscripcion.component.html',
  styleUrls: ['./mi-suscripcion.component.scss']
})
export class MiSuscripcionComponent implements OnInit, OnDestroy {
  planSuscripcion: string = 'free';
  limiteAlumnos: number = 5;
  diasTrialRestantes: number | null = null;
  alumnosActivos: number = 0;
  pagoPendiente: any = null;
  
  loading: boolean = true;
  private sub: Subscription;
  private subPago: Subscription;

  planes = [
    {
      id: 'free',
      nombre: 'Prueba el Sistema',
      precio: 0,
      periodo: '15 días',
      limite: 5,
      caracteristicas: ['Hasta 5 alumnos activos', 'Perfil público básico', 'Soporte estándar'],
      activo: false
    },
    {
      id: 'pro',
      nombre: 'Pro Mensual',
      precio: 299,
      periodo: 'mes',
      limite: 'Ilimitado',
      caracteristicas: ['Alumnos ilimitados', 'Perfil destacado prioritario', 'Soporte VIP', 'Estadísticas avanzadas'],
      activo: false
    },
    {
      id: 'anual',
      nombre: 'Pro Anual',
      precio: 2999,
      periodo: 'año',
      limite: 'Ilimitado',
      caracteristicas: ['Alumnos ilimitados', 'Ahorro de $589 MXN', 'Perfil súper destacado', 'Asesoría de crecimiento'],
      activo: false,
      recomendado: true
    }
  ];

  constructor(
    private entrenadorFirebase: EntrenadorFirebaseService,
    private toastr: NbToastrService,
    private dialogService: NbDialogService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
    
    // Escuchar si hay pagos pendientes
    this.subPago = this.entrenadorFirebase.getPagoSuscripcionPendiente().subscribe(pago => {
      this.pagoPendiente = pago;
    });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
    if (this.subPago) this.subPago.unsubscribe();
  }

  cargarDatos() {
    this.loading = true;
    this.sub = this.entrenadorFirebase.getDashboardStats().subscribe(stats => {
      this.planSuscripcion = stats.planSuscripcion || 'free';
      this.limiteAlumnos = stats.limiteAlumnos || 5;
      this.diasTrialRestantes = stats.diasTrialRestantes !== undefined ? stats.diasTrialRestantes : null;
      this.alumnosActivos = stats.clientesActivos || 0;
      
      this.planes.forEach(p => p.activo = p.id === this.planSuscripcion);
      this.loading = false;
    });
  }

  getProgresoTrial(): number {
    if (this.diasTrialRestantes === null || this.diasTrialRestantes < 0) return 100;
    return ((15 - this.diasTrialRestantes) / 15) * 100;
  }

  getProgresoAlumnos(): number {
    if (this.limiteAlumnos >= 999999) return 100;
    return (this.alumnosActivos / this.limiteAlumnos) * 100;
  }

  solicitarUpgrade(planId: string) {
    if (planId === this.planSuscripcion) {
      this.toastr.info('Ya cuentas con este plan activo.', 'Plan Actual');
      return;
    }
    
    if (this.pagoPendiente) {
      this.toastr.warning('Ya tienes un comprobante en revisión. Por favor espera a que un administrador valide tu pago.', 'Pago Pendiente');
      return;
    }

    const planSeleccionado = this.planes.find(p => p.id === planId);
    if (!planSeleccionado) return;

    // Abrir modal de pago / transferencia
    this.dialogService.open(PagoSuscripcionDialogComponent, {
      context: { plan: planSeleccionado }
    }).onClose.subscribe(enviado => {
      // El obs 'getPagoSuscripcionPendiente' actualizará automáticamente la vista si enviado === true
    });
  }
}

