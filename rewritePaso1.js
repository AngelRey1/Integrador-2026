
const fs = require("fs");
let html = fs.readFileSync("C:/Integrador-2026/ngx-admin/src/app/public/reserva-modal/reserva-modal.component.html", "utf8");

const p1Start = html.indexOf(`<!-- PASO 1:`);
const p2Start = html.indexOf(`<!-- PASO 2:`);

if (p1Start === -1 || p2Start === -1) {
  console.log("Could not find boundaries");
  process.exit(1);
}

const replacement = `<!-- PASO 1: Fecha y Hora - DISEÑO UNIFICADO COMPACTO -->
      <div class="paso-container" *ngIf="pasoActual === 1">

        <!-- Layout unificado: Convertido a flujo vertical -->
        <div class="reserva-layout-unificado">

          <!-- TOP: Panel de opciones (Plan recurrente) -->
          <div class="col-panel" style="width: 100%;">
            <div class="panel-plan" style="margin-bottom: 0;">
              <div class="plan-toggle" (click)="togglePlanSemanal()">
                <div class="toggle-info">
                  <nb-icon icon="sync-outline"></nb-icon>
                  <div>
                    <span class="toggle-titulo">Plan recurrente</span>
                    <span class="toggle-desc">Selecciona multi-días cada semana</span>
                  </div>
                </div>
                <div class="toggle-switch" [class.active]="usarPlanSemanal">
                  <div class="switch-thumb"></div>
                </div>
              </div>

              <!-- Configuración del plan (si está activo) -->
              <div class="plan-config" *ngIf="usarPlanSemanal">
                <div class="config-grupo">
                  <label>Semanas a repetir</label>
                  <div class="duracion-chips">
                    <button *ngFor="let d of duracionesDisponibles"
                            class="chip-dur"
                            [class.active]="planConfig.duracion === d.valor"
                            (click)="setPlanDuracion(d.valor)">
                      {{ d.label }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- MIDDLE: Calendario compacto -->
          <div class="col-calendario" style="width: 100%;">
            <div class="calendario-compacto" style="margin-top: 1rem;">
              <div class="cal-header">
                <button class="btn-cal-nav" (click)="cambiarMes(-1)" [disabled]="!puedeCambiarMes(-1)">
                  <nb-icon icon="chevron-left-outline"></nb-icon>
                </button>
                <div class="mes-actual">{{ meses[mesActual] }} {{ anioActual }}</div>
                <button class="btn-cal-nav" (click)="cambiarMes(1)" [disabled]="!puedeCambiarMes(1)">
                  <nb-icon icon="chevron-right-outline"></nb-icon>
                </button>
              </div>

              <div class="cal-grid">
                <div class="cal-day-header" *ngFor="let d of diasSemanaMap">{{ d }}</div>
                
                <div class="cal-days-container">
                  <ng-container *ngFor="let dia of calendario">
                    <div class="cal-day"
                         [class.empty]="!dia.dia"
                         [class.no-disponible]="!dia.disponible"
                         [class.disponible]="dia.disponible && dia.esMesActual"
                         [class.seleccionado]="dia.seleccionado"
                         [class.hoy]="dia.esHoy"
                         (click)="abrirSelectorHorario(dia)">
                      {{ dia.dia }}
                    </div>
                  </ng-container>
                </div>

                <div class="cal-leyenda">
                  <span><i class="dot disponible"></i>Disponible</span>
                  <span><i class="dot seleccionado"></i>Seleccionado</span>
                </div>
              </div>
            </div>
          </div>

          <!-- BOTTOM: Time picker & Personas -->
          <div class="col-panel" style="width: 100%;">
            <div class="panel-plan">
              <div class="config-manual">
                <div class="mensaje-selecciona-dia" *ngIf="!diaSeleccionandoHorario">
                  <nb-icon icon="arrow-up-outline"></nb-icon>
                  <p>{{ usarPlanSemanal ? "Selecciona uno o más días en el calendario para elegir su horario." : "Selecciona un día en el calendario de arriba para elegir su horario." }}</p>
                </div>

                <ng-container *ngIf="diaSeleccionandoHorario">

                  <!-- VERSION RESERVA UNICA -->
                  <div class="dia-config" *ngIf="!usarPlanSemanal">
                    <div class="fecha-header-inline">
                      <div class="fecha-info">
                        <nb-icon icon="calendar-outline"></nb-icon>
                        <h5>{{ parseFecha(diaSeleccionandoHorario.fecha) | date:"EEEE d \\"de\\" MMMM":':"es" | titlecase }}</h5>
                      </div>
                      <button class="btn-cancelar-dia" (click)="cerrarSelectorHorario()" title="Cancelar selección">×</button>
                    </div>

                    <div class="config-grupo">
                      <label>Horario para este día</label>
                      <div class="horario-inline">
                        <select [(ngModel)]="horarioTemporal.horaInicio" (ngModelChange)="onHoraInicioTemporalChange()">
                          <option value="">Inicio</option>
                          <option *ngFor="let h of horasDisponiblesDia" [value]="h">{{ h }}</option>
                        </select>
                        <span>a</span>
                        <select [(ngModel)]="horarioTemporal.horaFin" [disabled]="!horarioTemporal.horaInicio">
                          <option value="">Fin</option>
                          <option *ngFor="let h of horasFinDisponiblesDia" [value]="h">{{ h }}</option>
                        </select>
                      </div>
                    </div>
                    
                    <button class="btn-aplicar-plan mt-3"
                            [disabled]="!horarioTemporal.horaInicio || !horarioTemporal.horaFin"
                            (click)="confirmarSesionMultiple()">
                      <nb-icon icon="plus-circle-outline"></nb-icon>
                      Agregar esta sesión
                    </button>
                  </div>

                  <!-- VERSION PLAN RECURRENTE (MULTIPLES DIAS) -->
                  <ng-container *ngIf="usarPlanSemanal">
                    <div class="dia-config mb-3" *ngFor="let hm of horariosMultiples; let i = index">
                      <div class="fecha-header-inline">
                        <div class="fecha-info">
                          <nb-icon icon="calendar-outline"></nb-icon>
                          <h5>{{ hm.fecha | date:"EEEE d \\"de\\" MMMM":':"es" | titlecase }}</h5>
                        </div>
                        <button class="btn-cancelar-dia" (click)="removerDiaMultiple(i)" title="Quitar día">×</button>
                      </div>

                      <div class="config-grupo">
                        <label>Horario para este día</label>
                        <div class="horario-inline">
                           <select [(ngModel)]="hm.horaInicio" (ngModelChange)="onHoraInicioMultipleChange(i)">
                            <option value="">Inicio</option>
                            <option *ngFor="let h of hm.horasDisponibles" [value]="h">{{ h }}</option>
                          </select>
                          <span>a</span>
                          <select [(ngModel)]="hm.horaFin" [disabled]="!hm.horaInicio">
                            <option value="">Fin</option>
                            <option *ngFor="let h of hm.horasFinDisponibles" [value]="h">{{ h }}</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <button class="btn-aplicar-plan mt-3"
                            [disabled]="!todosHorariosSeleccionados()"
                            (click)="confirmarSesionMultiple()">
                      <nb-icon icon="plus-circle-outline"></nb-icon>
                      Agregar sesiones consecutivas
                    </button>
                  </ng-container>

                </ng-container>
              </div>

              <!-- Personas -->
              <div class="panel-personas">
                <label class="personas-label">
                  <nb-icon icon="people-outline"></nb-icon>
                  <span>Personas</span>
                </label>
                <div class="personas-counter">
                  <button (click)="decrementarPersonas()" [disabled]="(paso1Form.get(\"cantidadPersonas\")?.value || 1) <= 1">−</button>
                  <span>
                    {{ paso1Form.get("cantidadPersonas")?.value || 1 }}
                    <nb-icon icon="person-outline" style="font-size: 1.1rem; margin-left: 2px; vertical-align: middle;"></nb-icon>
                  </span>
                  <button (click)="incrementarPersonas()" [disabled]="(paso1Form.get(\"cantidadPersonas\")?.value || 1) >= capacidadMaximaMultiple">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SESIONES SELECCIONADAS (abajo) -->
        <div class="sesiones-compactas" *ngIf="sesionesSeleccionadas.length > 0">
          <div class="sesiones-header-compact">
            <span><nb-icon icon="list-outline"></nb-icon> {{ sesionesSeleccionadas.length }} sesión(es)</span>
            <button class="btn-limpiar-small" (click)="limpiarSesiones()" *ngIf="sesionesSeleccionadas.length > 1">
              Limpiar
            </button>
          </div>
          <div class="sesiones-tags">
            <div class="sesion-tag" *ngFor="let sesion of sesionesSeleccionadas; let i = index">
              <span class="tag-fecha">{{ parseFecha(sesion.fecha) | date:"dd MMM":':"es" }}</span>
              <span class="tag-hora">{{ sesion.horaInicio }} - {{ sesion.horaFin }}</span>
              <button (click)="eliminarSesionTemporal(i)"><nb-icon icon="close-outline"></nb-icon></button>
            </div>
          </div>
          <div class="total-compacto">
            <div class="total-info">
              <span class="total-label">Total</span>
              <span class="total-calc">
                {{ sesionesSeleccionadas.length }} sesión(es) × \${{ entrenador?.precio || 0 }} ×
                {{ paso1Form.get("cantidadPersonas")?.value || 1 }} <nb-icon icon="person-outline" style="font-size: 0.9em; vertical-align: middle;"></nb-icon>
              </span>
            </div>
            <span class="total-monto">\${{ calcularPrecioTotalMultiple() | number:"1.0-0" }}</span>
          </div>
        </div>
      </div>

      `;

let newHtml = html.substring(0, p1Start) + replacement + html.substring(p2Start);

fs.writeFileSync("C:/Integrador-2026/ngx-admin/src/app/public/reserva-modal/reserva-modal.component.html", newHtml, "utf8");
console.log("Rewrote PASO 1 with structurally verified HTML and multiple selectors!");

