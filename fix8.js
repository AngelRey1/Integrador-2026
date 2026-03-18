const fs = require('fs');
const path = 'ngx-admin/src/app/public/reserva-modal/reserva-modal.component.html';
let content = fs.readFileSync(path, 'utf8');

const oldHtml = `                <div class="dia-config" *ngIf="diaSeleccionandoHorario">
                  <div class="fecha-header-inline">
                    <div class="fecha-info">
                      <nb-icon icon="calendar-outline"></nb-icon>
                      <h5 *ngIf="!usarPlanSemanal">{{ parseFecha(diaSeleccionandoHorario.fecha) | date:'EEEE d \\'de\\' MMMM':'':'es' | titlecase }}</h5>
                      <h5 *ngIf="usarPlanSemanal">{{ diasPlanSeleccionadosTemp.length }} día(s) seleccionado(s)</h5>
                    </div>
                    <button class="btn-cancelar-dia" (click)="cerrarSelectorHorario()" title="Cancelar selección">×</button>
                  </div>

                  <div class="config-grupo">
                    <label>Horario para {{ usarPlanSemanal ? 'estos días' : 'este día' }}</label>
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

                  <div class="horarios-rapidos-inline" *ngIf="rangosDisponiblesDia?.length > 0">
                    <span class="rapidos-titulo"><nb-icon icon="flash-outline"></nb-icon> Horarios disponibles:</span>
                    <div class="rapidos-chips-inline">
                      <button class="chip-horario-inline" *ngFor="let r of rangosDisponiblesDia"
                              (click)="aplicarRangoTemporal(r)"
                              [class.selected]="horarioTemporal.horaInicio === r.inicio && horarioTemporal.horaFin === r.fin">
                        {{ r.inicio }} - {{ r.fin }}
                      </button>
                    </div>
                  </div>

                  <button class="btn-aplicar-plan mt-3"
                          [disabled]="!horarioTemporal.horaInicio || !horarioTemporal.horaFin"
                          (click)="confirmarSesionMultiple()">
                    <nb-icon icon="plus-circle-outline"></nb-icon>
                    Agregar esta sesión
                  </button>
                </div>`;


const newHtml = `                <!-- Modo Plan Recurrente: Múltiples Días Independientes -->
                <div *ngIf="diaSeleccionandoHorario && usarPlanSemanal && horariosMultiples.length > 0" class="dias-multiples-container">
                  <div class="dia-config" *ngFor="let hm of horariosMultiples; let i = index">
                    <div class="fecha-header-inline">
                      <div class="fecha-info">
                        <nb-icon icon="calendar-outline"></nb-icon>
                        <h5>{{ parseFecha(hm.fecha) | date:'EEEE d \\'de\\' MMMM':'':'es' | titlecase }}</h5>
                      </div>
                      <button class="btn-cancelar-dia" (click)="removerDiaMultiple(i)" title="Cancelar día">×</button>
                    </div>

                    <div class="config-grupo">
                      <label>Horario</label>
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
                    Agregar sesiones al plan
                  </button>
                </div>

                <!-- Modo Un Sólo Día -->
                <div class="dia-config" *ngIf="diaSeleccionandoHorario && !usarPlanSemanal">
                  <div class="fecha-header-inline">
                    <div class="fecha-info">
                      <nb-icon icon="calendar-outline"></nb-icon>
                      <h5>{{ parseFecha(diaSeleccionandoHorario.fecha) | date:'EEEE d \\'de\\' MMMM':'':'es' | titlecase }}</h5>
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

                  <div class="horarios-rapidos-inline" *ngIf="rangosDisponiblesDia?.length > 0">
                    <span class="rapidos-titulo"><nb-icon icon="flash-outline"></nb-icon> Horarios disponibles:</span>
                    <div class="rapidos-chips-inline">
                      <button class="chip-horario-inline" *ngFor="let r of rangosDisponiblesDia"
                              (click)="aplicarRangoTemporal(r)"
                              [class.selected]="horarioTemporal.horaInicio === r.inicio && horarioTemporal.horaFin === r.fin">
                        {{ r.inicio }} - {{ r.fin }}
                      </button>
                    </div>
                  </div>

                  <button class="btn-aplicar-plan mt-3"
                          [disabled]="!horarioTemporal.horaInicio || !horarioTemporal.horaFin"
                          (click)="confirmarSesionMultiple()">
                    <nb-icon icon="plus-circle-outline"></nb-icon>
                    Agregar esta sesión
                  </button>
                </div>`;

content = content.replace(oldHtml, newHtml);

fs.writeFileSync(path, content);
console.log('Done HTML replacement');
