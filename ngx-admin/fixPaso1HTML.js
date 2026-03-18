const fs = require('fs');

let html = fs.readFileSync('src/app/public/reserva-modal/reserva-modal.component.html', 'utf8');

const regexPaso1 = /<!-- PASO 1.*?\n([\s\S]*?)<!-- PASO 2: Confirmar/g;
let m = html.match(/<!-- PASO 1[\s\S]*?<!-- PASO 2/);
if (!m) {
    console.log("No encontre PASO 1");
    process.exit(1);
}

const nuevoPaso1 = `<!-- PASO 1: Fecha y Hora Original -->
      <div class="paso-container" *ngIf="pasoActual === 1">

        <!-- TOP PANEL: Toggle Plan y Duración -->
        <div class="top-settings-panel">
          <div class="plan-toggle">
            <span class="toggle-label" [class.active]="!usarPlanSemanal">Sesión Única</span>
            <nb-toggle [checked]="usarPlanSemanal" (change)="togglePlanSemanal()" status="primary"></nb-toggle>
            <span class="toggle-label" [class.active]="usarPlanSemanal">Plan Semanal</span>
          </div>

          <!-- Si es plan semanal, controles extra -->
          <div *ngIf="usarPlanSemanal" class="plan-extra-controls">
            <label>Duración del Plan:</label>
            <nb-select [(selected)]="planConfig.duracion" (selectedChange)="actualizarConteoSesionesPlan()" status="primary">
              <nb-option [value]="4">4 semanas (1 mes)</nb-option>
              <nb-option [value]="8">8 semanas (2 meses)</nb-option>
              <nb-option [value]="12">12 semanas (3 meses)</nb-option>
            </nb-select>
          </div>
        </div>

        <div class="reserva-layout-unificado">
          <!-- COLUMNA IZQUIERDA: Calendario -->
          <div class="col-calendario">
            <div class="calendario-compacto">
              <div class="cal-header">
                <button class="cal-nav" (click)="cambiarMes(-1)"><nb-icon icon="arrow-ios-back-outline"></nb-icon></button>
                <div class="mes-actual">{{ meses[mesActual.getMonth()] }} {{ mesActual.getFullYear() }}</div>
                <button class="cal-nav" (click)="cambiarMes(1)"><nb-icon icon="arrow-ios-forward-outline"></nb-icon></button>
              </div>
              <div class="cal-dias-semana">
                <div class="cal-dia-head" *ngFor="let dia of ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']">{{ dia }}</div>
              </div>
              <div class="cal-grid">
                <ng-container *ngFor="let semana of calendarioMes">
                  <div 
                    *ngFor="let dia of semana" 
                    class="cal-celda" 
                    [class.vacio]="!dia.esMesActual"
                    [class.pasado]="!dia.disponible"
                    [class.seleccionado]="dia.seleccionado"
                    [class.tiene-cupo]="dia.disponible && dia.esMesActual"
                    (click)="abrirSelectorHorario(dia)">
                    {{ dia.fecha | date:'d' }}
                  </div>
                </ng-container>
              </div>
            </div>
            
            <div class="leyenda-cal">
              <div class="badge-leyenda"><span class="dot disponible"></span> Disponible</div>
              <div class="badge-leyenda"><span class="dot seleccionado"></span> Seleccionado</div>
            </div>
          </div>

          <!-- COLUMNA DERECHA: Horario temporal y carrito de seleccionadas -->
          <div class="col-horario">
            
            <div class="panel-horario-temporal" *ngIf="diasPlanSeleccionadosTemp && diasPlanSeleccionadosTemp.length > 0">
              <h6>Definir horario para:</h6>
              <div class="flex-row-gap">
                <div class="fecha-temporal" *ngFor="let dt of diasPlanSeleccionadosTemp">
                  <nb-icon icon="calendar-outline"></nb-icon> {{dt.fecha | date:'dd/MM'}}
                </div>
              </div>

              <div class="horarios-grid mt-3">
                <label>Hora Inicio:</label>
                <nb-select [(selected)]="horarioTemporal.horaInicio" (selectedChange)="seleccionarHoraInicioTemporal($event)" placeholder="Inicio" fullWidth size="small">
                  <nb-option *ngIf="horasDisponiblesDia.length === 0" disabled>Sin disponibilidad</nb-option>
                  <nb-option *ngFor="let hora of horasDisponiblesDia" [value]="hora">{{hora}}</nb-option>
                </nb-select>
              </div>
              
              <div class="horarios-grid mt-2" *ngIf="horasFinDisponiblesDia.length > 0">
                <label>Hora Fin:</label>
                <nb-select [(selected)]="horarioTemporal.horaFin" placeholder="Fin" fullWidth size="small">
                  <nb-option *ngFor="let hora of horasFinDisponiblesDia" [value]="hora">{{hora}}</nb-option>
                </nb-select>
              </div>

              <div class="panel-acciones mt-3">
                <button nbButton size="small" status="basic" (click)="cerrarSelectorHorario()">Cancelar</button>
                <button nbButton size="small" status="success" (click)="confirmarSesionTemporal()" [disabled]="!horarioTemporal.horaInicio || !horarioTemporal.horaFin">
                  Confirmar Sesión
                </button>
              </div>
            </div>

            <!-- SESIONES SELECCIONADAS CART -->
            <div class="carrito-sesiones mt-4">
              <h6>Sesiones Confirmadas ({{ totalSesionesSeleccionadas }})</h6>
              
              <div class="lista-sesiones" *ngIf="(sesionesSeleccionadas.length > 0) || (usarPlanSemanal && sesionesGeneradasPlan.length > 0)">
                <!-- Únicas -->
                <ng-container *ngIf="!usarPlanSemanal">
                  <div class="sesion-item" *ngFor="let sesion of sesionesSeleccionadas; let i = index">
                    <div class="sesion-info">
                      <div class="sf-fecha">{{ sesion.fecha | date:'EE, MMM d' }}</div>
                      <div class="sf-hora">{{ sesion.horaInicio }} - {{ sesion.horaFin }}</div>
                    </div>
                    <button nbButton size="tiny" status="danger" ghost (click)="eliminarSesionSeleccionada(i)">
                      <nb-icon icon="trash-2-outline"></nb-icon>
                    </button>
                  </div>
                </ng-container>

                <!-- Plan Semanal -->
                <ng-container *ngIf="usarPlanSemanal">
                  <div class="sesion-item" *ngFor="let sesion of sesionesGeneradasPlan; let i = index">
                    <div class="sesion-info">
                      <div class="sf-fecha">{{ sesion.fecha | date:'EE, MMM d' }}</div>
                      <div class="sf-hora">{{ sesion.horaInicio }} - {{ sesion.horaFin }}</div>
                    </div>
                  </div>
                </ng-container>
              </div>

              <div class="empty-state" *ngIf="totalSesionesSeleccionadas === 0">
                <nb-icon icon="calendar-outline"></nb-icon>
                <p>Selecciona un día y hora</p>
              </div>
            </div>

          </div>
        </div>

        <div class="step-actions mt-4">
          <button nbButton status="primary" [disabled]="!paso1Form.valid || totalSesionesSeleccionadas === 0" (click)="irAlPaso2()">
            Continuar <nb-icon icon="arrow-forward-outline"></nb-icon>
          </button>
        </div>
      </div>
      
      <!--`;

html = html.replace(/<!-- PASO 1[\s\S]*?<!-- PASO 2/g, nuevoPaso1 + ' PASO 2');

fs.writeFileSync('src/app/public/reserva-modal/reserva-modal.component.html', html, 'utf8');
console.log("HTML Layout Actualizado");
