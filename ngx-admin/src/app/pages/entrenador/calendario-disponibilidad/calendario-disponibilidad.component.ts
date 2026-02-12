import { Component, OnInit, OnDestroy } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { EntrenadorFirebaseService } from '../../../@core/services/entrenador-firebase.service';
import { Subscription } from 'rxjs';

interface RangoHorario {
  inicio: string;
  fin: string;
  capacidad: number;       // Número máximo de personas que puede atender
  tipoSesion: 'individual' | 'grupal' | 'ambos';  // Tipo de sesión permitida
}

interface DiaDisponibilidad {
  nombre: string;
  nombreCorto: string;
  habilitado: boolean;
  rangos: RangoHorario[];
}

@Component({
  selector: 'ngx-calendario-disponibilidad',
  templateUrl: './calendario-disponibilidad.component.html',
  styleUrls: ['./calendario-disponibilidad.component.scss']
})
export class CalendarioDisponibilidadComponent implements OnInit, OnDestroy {
  loading = true;
  guardando = false;
  private subscription: Subscription | null = null;

  // Opciones de horas para los selectores
  horasDisponibles: string[] = [];

  // Opciones de tipo de sesión
  tiposSesion = [
    { value: 'individual', label: 'Individual', icon: 'person-outline' },
    { value: 'grupal', label: 'Grupal', icon: 'people-outline' },
    { value: 'ambos', label: 'Ambos', icon: 'swap-outline' }
  ];

  // Opciones de capacidad
  opcionesCapacidad: number[] = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20];

  // Días de la semana con su disponibilidad
  diasSemana: DiaDisponibilidad[] = [
    { nombre: 'Lunes', nombreCorto: 'lunes', habilitado: true, rangos: [{ inicio: '09:00', fin: '18:00', capacidad: 1, tipoSesion: 'individual' }] },
    { nombre: 'Martes', nombreCorto: 'martes', habilitado: true, rangos: [{ inicio: '09:00', fin: '18:00', capacidad: 1, tipoSesion: 'individual' }] },
    { nombre: 'Miércoles', nombreCorto: 'miercoles', habilitado: true, rangos: [{ inicio: '09:00', fin: '18:00', capacidad: 1, tipoSesion: 'individual' }] },
    { nombre: 'Jueves', nombreCorto: 'jueves', habilitado: true, rangos: [{ inicio: '09:00', fin: '18:00', capacidad: 1, tipoSesion: 'individual' }] },
    { nombre: 'Viernes', nombreCorto: 'viernes', habilitado: true, rangos: [{ inicio: '09:00', fin: '18:00', capacidad: 1, tipoSesion: 'individual' }] },
    { nombre: 'Sábado', nombreCorto: 'sabado', habilitado: false, rangos: [] },
    { nombre: 'Domingo', nombreCorto: 'domingo', habilitado: false, rangos: [] }
  ];

  constructor(
    private toastrService: NbToastrService,
    private entrenadorFirebase: EntrenadorFirebaseService
  ) {
    // Generar horas de 06:00 a 22:00
    for (let h = 6; h <= 22; h++) {
      this.horasDisponibles.push(`${h.toString().padStart(2, '0')}:00`);
    }
  }

  ngOnInit(): void {
    this.cargarDisponibilidad();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  cargarDisponibilidad(): void {
    this.loading = true;
    this.subscription = this.entrenadorFirebase.getMiPerfil().subscribe(perfil => {
      if (perfil?.disponibilidad) {
        // Cargar disponibilidad desde Firebase
        this.diasSemana.forEach(dia => {
          const disponibilidadDia = perfil.disponibilidad[dia.nombreCorto];
          if (disponibilidadDia && Array.isArray(disponibilidadDia) && disponibilidadDia.length > 0) {
            dia.habilitado = true;
            dia.rangos = disponibilidadDia.map((r: any) => ({
              inicio: r.inicio || '09:00',
              fin: r.fin || '18:00',
              capacidad: r.capacidad || 1,
              tipoSesion: r.tipoSesion || 'individual'
            }));
          } else {
            dia.habilitado = false;
            dia.rangos = [];
          }
        });
      }
      this.loading = false;
    });
  }

  toggleDia(dia: DiaDisponibilidad): void {
    dia.habilitado = !dia.habilitado;
    if (dia.habilitado && dia.rangos.length === 0) {
      // Agregar rango por defecto al habilitar
      dia.rangos.push({ inicio: '09:00', fin: '18:00', capacidad: 1, tipoSesion: 'individual' });
    }
  }

  agregarRango(dia: DiaDisponibilidad): void {
    // Agregar un nuevo rango con horario por defecto
    const ultimoRango = dia.rangos[dia.rangos.length - 1];
    let nuevoInicio = '14:00';
    let nuevoFin = '18:00';
    let capacidad = 1;
    let tipoSesion: 'individual' | 'grupal' | 'ambos' = 'individual';
    
    if (ultimoRango) {
      // Calcular horario siguiente al último rango
      const horaFin = parseInt(ultimoRango.fin.split(':')[0]);
      if (horaFin < 21) {
        nuevoInicio = `${(horaFin + 1).toString().padStart(2, '0')}:00`;
        nuevoFin = `${Math.min(horaFin + 4, 22).toString().padStart(2, '0')}:00`;
      }
      // Copiar configuración del último rango
      capacidad = ultimoRango.capacidad;
      tipoSesion = ultimoRango.tipoSesion;
    }
    
    dia.rangos.push({ inicio: nuevoInicio, fin: nuevoFin, capacidad, tipoSesion });
  }

  eliminarRango(dia: DiaDisponibilidad, index: number): void {
    dia.rangos.splice(index, 1);
    // Si no quedan rangos, deshabilitar el día
    if (dia.rangos.length === 0) {
      dia.habilitado = false;
    }
  }

  validarRango(rango: RangoHorario): boolean {
    const inicio = parseInt(rango.inicio.split(':')[0]);
    const fin = parseInt(rango.fin.split(':')[0]);
    return fin > inicio;
  }

  getHorasFinDisponibles(rango: RangoHorario): string[] {
    const horaInicio = parseInt(rango.inicio.split(':')[0]);
    return this.horasDisponibles.filter(h => {
      const hora = parseInt(h.split(':')[0]);
      return hora > horaInicio;
    });
  }

  async guardarDisponibilidad(): Promise<void> {
    // Validar rangos
    for (const dia of this.diasSemana) {
      if (dia.habilitado) {
        for (const rango of dia.rangos) {
          if (!this.validarRango(rango)) {
            this.toastrService.warning(
              `En ${dia.nombre}: la hora de fin debe ser mayor que la de inicio`,
              'Horario inválido'
            );
            return;
          }
        }
      }
    }

    this.guardando = true;

    // Construir objeto de disponibilidad
    const disponibilidad: { [key: string]: any[] } = {};
    
    this.diasSemana.forEach(dia => {
      if (dia.habilitado && dia.rangos.length > 0) {
        disponibilidad[dia.nombreCorto] = dia.rangos.map(r => ({
          inicio: r.inicio,
          fin: r.fin,
          capacidad: r.capacidad,
          tipoSesion: r.tipoSesion
        }));
      } else {
        disponibilidad[dia.nombreCorto] = [];
      }
    });

    try {
      const result = await this.entrenadorFirebase.actualizarPerfil({
        disponibilidad: disponibilidad
      });

      if (result.success) {
        this.toastrService.success('Disponibilidad guardada correctamente', 'Éxito');
      } else {
        this.toastrService.danger(result.message || 'Error al guardar', 'Error');
      }
    } catch (error) {
      console.error('Error al guardar disponibilidad:', error);
      this.toastrService.danger('Error al guardar la disponibilidad', 'Error');
    } finally {
      this.guardando = false;
    }
  }

  // Obtener resumen de disponibilidad para mostrar
  getResumenDia(dia: DiaDisponibilidad): string {
    if (!dia.habilitado || dia.rangos.length === 0) {
      return 'No disponible';
    }
    return dia.rangos.map(r => {
      const tipo = r.tipoSesion === 'individual' ? '👤' : r.tipoSesion === 'grupal' ? '👥' : '👤👥';
      return `${r.inicio} - ${r.fin} (${r.capacidad} pers. ${tipo})`;
    }).join(', ');
  }

  // Obtener icono para tipo de sesión
  getTipoSesionIcon(tipo: string): string {
    const encontrado = this.tiposSesion.find(t => t.value === tipo);
    return encontrado ? encontrado.icon : 'person-outline';
  }
}
