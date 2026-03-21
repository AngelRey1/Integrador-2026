import { Component, OnInit, OnDestroy } from '@angular/core';
import { NbToastrService, NbDialogService } from '@nebular/theme';
import { AdminFirebaseService } from '../../../../core/services/admin-firebase.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-validar-suscripciones',
  templateUrl: './validar-suscripciones.component.html',
  styleUrls: ['./validar-suscripciones.component.scss']
})
export class ValidarSuscripcionesComponent implements OnInit, OnDestroy {
  pagos: any[] = [];
  filteredPagos: any[] = [];
  filterEstado = 'pendiente';
  loading = true;
  procesando: { [id: string]: boolean } = {};

  private sub: Subscription | null = null;

  stats = { pendientes: 0, aprobados: 0, rechazados: 0 };

  constructor(
    private adminFirebase: AdminFirebaseService,
    private toastr: NbToastrService
  ) {}

  ngOnInit(): void {
    this.cargarPagos();
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  cargarPagos(): void {
    this.loading = true;
    this.sub = this.adminFirebase.getPagosSuscripcion('todos').subscribe(pagos => {
      this.pagos = pagos.map(p => ({
        ...p,
        fechaSolicitud: p.fechaSolicitud?.seconds ? new Date(p.fechaSolicitud.seconds * 1000) : new Date()
      }));
      this.stats.pendientes = this.pagos.filter(p => p.estado === 'pendiente').length;
      this.stats.aprobados  = this.pagos.filter(p => p.estado === 'aprobado').length;
      this.stats.rechazados = this.pagos.filter(p => p.estado === 'rechazado').length;
      this.applyFilter();
      this.loading = false;
    });
  }

  applyFilter(): void {
    this.filteredPagos = this.filterEstado === 'todos'
      ? this.pagos
      : this.pagos.filter(p => p.estado === this.filterEstado);
  }

  onFilterChange(estado: string): void {
    this.filterEstado = estado;
    this.applyFilter();
  }

  async aprobar(pago: any): Promise<void> {
    if (!confirm(`¿Confirmar aprobación del plan "${pago.planSolicitado}" para ${pago.entrenadorNombre}?`)) return;
    this.procesando[pago.id] = true;
    const res = await this.adminFirebase.aprobarPagoSuscripcion(pago.id, pago.entrenadorId, pago.planSolicitado);
    this.procesando[pago.id] = false;
    if (res.success) {
      this.toastr.success(res.message, 'Plan Activado');
    } else {
      this.toastr.danger(res.message, 'Error');
    }
  }

  async rechazar(pago: any): Promise<void> {
    const motivo = prompt('Ingresa el motivo del rechazo (se mostrará al entrenador):');
    if (!motivo) return;
    this.procesando[pago.id] = true;
    const res = await this.adminFirebase.rechazarPagoSuscripcion(pago.id, motivo);
    this.procesando[pago.id] = false;
    if (res.success) {
      this.toastr.warning('Pago rechazado correctamente', 'Rechazado');
    } else {
      this.toastr.danger(res.message, 'Error');
    }
  }

  verComprobante(url: string): void {
    window.open(url, '_blank');
  }

  getNombrePlan(planId: string): string {
    const nombres: { [k: string]: string} = {
      'free': 'Prueba Gratuita',
      'pro_mensual': 'Pro Mensual ($220)',
      'pro_anual': 'Pro Anual ($2,000)'
    };
    return nombres[planId] || planId;
  }

  getBadgeStatus(estado: string): string {
    return { pendiente: 'warning', aprobado: 'success', rechazado: 'danger' }[estado] || 'basic';
  }

  formatFecha(fecha: Date): string {
    return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(fecha);
  }
}
