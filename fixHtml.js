
const fs = require("fs");
let html = fs.readFileSync("C:/Integrador-2026/ngx-admin/src/app/public/reserva-modal/reserva-modal.component.html", "utf8");

const sIdx = html.indexOf(`<ng-container *ngIf="diaSeleccionandoHorario">`);
const eIdx = html.indexOf(`<!-- Personas -->`);

if (sIdx !== -1 && eIdx !== -1) {
    const replacement = `<ng-container *ngIf="diaSeleccionandoHorario">

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

</ng-container>`;

    const chunk = html.substring(0, sIdx) + replacement + "\n\n" + html.substring(eIdx);

  fs.writeFileSync("C:/Integrador-2026/ngx-admin/src/app/public/reserva-modal/reserva-modal.component.html", chunk, "utf8");
  console.log("Success replacing exact nodes.");
} else {
  console.log("Could not find boundaries", sIdx, eIdx);
}

