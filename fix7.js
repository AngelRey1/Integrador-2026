const fs = require('fs');
const path = 'ngx-admin/src/app/public/reserva-modal/reserva-modal.component.ts';
let content = fs.readFileSync(path, 'utf8');

// Replace abrirSelectorHorario
const oldAbrir = `  abrirSelectorHorario(dia: DiaCalendario) {
    if (!dia.esMesActual) {
      return;
    }

    if (!dia.disponible) {
      const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      const nombreDia = diasSemana[dia.fecha.getDay()];
      this.mostrarMensajeFeedback(\`El entrenador no tiene disponibilidad los \${nombreDia}. Selecciona otro día.\`);
      return;
    }

    if (this.usarPlanSemanal) {
      const fechaStr = this.formatearFechaISO(dia.fecha);
      const tempIdx = this.diasPlanSeleccionadosTemp.findIndex(d => this.formatearFechaISO(d) === fechaStr);

      if (tempIdx >= 0) {
        this.diasPlanSeleccionadosTemp.splice(tempIdx, 1);
        dia.seleccionado = false;
      } else {
        this.diasPlanSeleccionadosTemp.push(dia.fecha);
        dia.seleccionado = true;
      }

      if (this.diasPlanSeleccionadosTemp.length === 0) {
        this.cerrarSelectorHorario();
      } else {
        // Marcamos el primero como ancla para el panel
        this.diaSeleccionandoHorario = dia;
        this.horarioTemporal = { horaInicio: '', horaFin: '' };
        this.cargarHorariosParaDiasSeleccionados();
      }
      this.generarCalendario(); // Para repintar el multi-select
      return;
    }`;

const newAbrir = `  abrirSelectorHorario(dia: DiaCalendario) {
    if (!dia.esMesActual) {
      return;
    }

    // Initialize array if undefined
    if (!this.horariosMultiples) this.horariosMultiples = [];

    if (!dia.disponible) {
      const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      const nombreDia = diasSemana[dia.fecha.getDay()];
      this.mostrarMensajeFeedback(\`El entrenador no tiene disponibilidad los \${nombreDia}. Selecciona otro día.\`);
      return;
    }

    if (this.usarPlanSemanal) {
      const fechaStr = this.formatearFechaISO(dia.fecha);
      const tempIdx = this.diasPlanSeleccionadosTemp.findIndex(d => this.formatearFechaISO(d) === fechaStr);
      const multiIdx = this.horariosMultiples.findIndex(hm => this.formatearFechaISO(hm.fecha) === fechaStr);

      if (tempIdx >= 0) {
        this.diasPlanSeleccionadosTemp.splice(tempIdx, 1);
        if (multiIdx >= 0) this.horariosMultiples.splice(multiIdx, 1);
        dia.seleccionado = false;
      } else {
        this.diasPlanSeleccionadosTemp.push(dia.fecha);
        this.horariosMultiples.push({
          fecha: dia.fecha,
          horaInicio: '',
          horaFin: '',
          horasDisponibles: this.obtenerHorasDisponiblesPara(dia.fecha),
          horasFinDisponibles: []
        });
        dia.seleccionado = true;
      }

      if (this.diasPlanSeleccionadosTemp.length === 0) {
        this.cerrarSelectorHorario();
      } else {
        this.diaSeleccionandoHorario = dia;
      }
      this.generarCalendario(); // Para repintar el multi-select
      return;
    }`;

content = content.replace(oldAbrir, newAbrir);

const newMethods = `  /**
   * Obtener horas disponibles para un dia específico
   */
  obtenerHorasDisponiblesPara(fecha: Date): string[] {
    const diaSemana = fecha.getDay();
    const diaKey = this.diasSemana[diaSemana];
    const disponibilidadDia = this.entrenador?.disponibilidad?.[diaKey];
    
    if (disponibilidadDia && Array.isArray(disponibilidadDia)) {
      const todasHoras = new Set<string>();
      disponibilidadDia.forEach((rango: any) => {
        if (rango.inicio && rango.fin) {
          const horaInicio = parseInt(rango.inicio.split(':')[0]);
          const horaFin = parseInt(rango.fin.split(':')[0]);
          for (let h = horaInicio; h <= horaFin; h++) {
            todasHoras.add(\`\${h.toString().padStart(2, '0')}:00\`);
          }
        }
      });
      const horasArray = Array.from(todasHoras).sort();
      return horasArray.slice(0, -1);
    }
    return [];
  }

  removerDiaMultiple(index: number) {
    if (!this.horariosMultiples || index < 0 || index >= this.horariosMultiples.length) return;
    
    const fechaEliminada = this.horariosMultiples[index].fecha;
    this.horariosMultiples.splice(index, 1);
    const fechaStr = this.formatearFechaISO(fechaEliminada);
    
    const tempIdx = this.diasPlanSeleccionadosTemp.findIndex(d => this.formatearFechaISO(d) === fechaStr);
    if (tempIdx >= 0) this.diasPlanSeleccionadosTemp.splice(tempIdx, 1);
    
    if (this.diasPlanSeleccionadosTemp.length === 0) {
       this.cerrarSelectorHorario();
    }
    
    this.generarCalendario();
  }

  onHoraInicioMultipleChange(index: number) {
    const hm = this.horariosMultiples[index];
    if (!hm || !hm.horaInicio) return;
    
    const horaInicioSeleccionada = this.parseHora(hm.horaInicio);
    const diaSemana = hm.fecha.getDay();
    const diaKey = this.diasSemana[diaSemana];
    const disponibilidadDia = this.entrenador?.disponibilidad?.[diaKey];      
    
    if (disponibilidadDia && Array.isArray(disponibilidadDia)) {
      const horasFin = new Set<string>();
      disponibilidadDia.forEach((rango: any) => {
        if (rango.inicio && rango.fin) {
          const horaInicio = parseInt(rango.inicio.split(':')[0]);
          const horaFin = parseInt(rango.fin.split(':')[0]);
          for (let h = horaInicio; h <= horaFin; h++) {
            const horaMin = h * 60;
            if (horaMin > horaInicioSeleccionada) {
              horasFin.add(\`\${h.toString().padStart(2, '0')}:00\`);
            }
          }
        }
      });
      hm.horasFinDisponibles = Array.from(horasFin).sort();
    } else {
      hm.horasFinDisponibles = [];
    }
    
    if (hm.horaFin && !hm.horasFinDisponibles.includes(hm.horaFin)) {
      hm.horaFin = '';
    }
    
    this.cdr.detectChanges();
  }

  todosHorariosSeleccionados(): boolean {
    if (!this.horariosMultiples || this.horariosMultiples.length === 0) return false;
    return this.horariosMultiples.every(hm => hm.horaInicio && hm.horaFin);
  }

`;

content = content.replace('  cerrarSelectorHorario() {', newMethods + '  cerrarSelectorHorario() {');

// Update cerrarSelectorHorario to clear horariosMultiples
const oldCerrar = `  cerrarSelectorHorario() {
    this.diaSeleccionandoHorario = null;
    if (this.usarPlanSemanal) {
      this.diasPlanSeleccionadosTemp = [];
      this.generarCalendario();
    }
    this.horarioTemporal = { horaInicio: '', horaFin: '' };
  }`;

const newCerrar = `  cerrarSelectorHorario() {
    this.diaSeleccionandoHorario = null;
    if (this.usarPlanSemanal) {
      this.diasPlanSeleccionadosTemp = [];
      this.horariosMultiples = [];
      this.generarCalendario();
    }
    this.horarioTemporal = { horaInicio: '', horaFin: '' };
  }`;

content = content.replace(oldCerrar, newCerrar);

// Update confirmarSesionMultiple
const oldConfirmarParte1 = `  confirmarSesionMultiple() {
    if (!this.horarioTemporal.horaInicio || !this.horarioTemporal.horaFin) {
      this.mostrarMensajeFeedback('Debes seleccionar hora de inicio y fin');
      return;
    }

    const duracion = this.parseHora(this.horarioTemporal.horaFin) - this.parseHora(this.horarioTemporal.horaInicio);
    const sesionesAgregadas = [];

    if (this.usarPlanSemanal) {
      if (this.diasPlanSeleccionadosTemp.length === 0) {
        this.mostrarMensajeFeedback('Debes seleccionar al menos un día en el calendario');
        return;
      }

      const totalSemanas = this.planConfig.duracion || 4;

      for (const fechaOriginal of this.diasPlanSeleccionadosTemp) {
        for (let i = 0; i < totalSemanas; i++) {
          const dateToAdd = new Date(fechaOriginal);
          dateToAdd.setDate(dateToAdd.getDate() + (i * 7));
          const fechaStr = this.formatearFechaISO(dateToAdd);

          // avoid duplication
          const exists = this.sesionesSeleccionadas.find(
             s => s.fecha === fechaStr && s.horaInicio === this.horarioTemporal.horaInicio
          );

          if (!exists) {
              const nuevaSesion = {
                  fecha: fechaStr,
                  horaInicio: this.horarioTemporal.horaInicio,
                  horaFin: this.horarioTemporal.horaFin,
                  duracionMinutos: duracion
              };
              this.sesionesSeleccionadas.push(nuevaSesion);
              sesionesAgregadas.push(nuevaSesion);
          }
        }
      }
      this.mostrarMensajeFeedback(\`¡\${sesionesAgregadas.length} sesiones agregadas a tu plan recurrente!\`);
      // Limpiar selección temporal
      this.diasPlanSeleccionadosTemp = [];

    } else {
      if (!this.diaSeleccionandoHorario) {
        this.mostrarMensajeFeedback('Debes seleccionar un día');
        return;
      }`;


const newConfirmarParte1 = `  confirmarSesionMultiple() {
    const sesionesAgregadas = [];

    if (this.usarPlanSemanal) {
      if (!this.todosHorariosSeleccionados()) {
        this.mostrarMensajeFeedback('Debes seleccionar hora de inicio y fin para todos los días');
        return;
      }

      const totalSemanas = this.planConfig.duracion || 4;

      for (const hm of this.horariosMultiples) {
        const duracion = this.parseHora(hm.horaFin) - this.parseHora(hm.horaInicio);
        for (let i = 0; i < totalSemanas; i++) {
          const dateToAdd = new Date(hm.fecha);
          dateToAdd.setDate(dateToAdd.getDate() + (i * 7));
          const fechaStr = this.formatearFechaISO(dateToAdd);

          // avoid duplication
          const exists = this.sesionesSeleccionadas.find(
             s => s.fecha === fechaStr && s.horaInicio === hm.horaInicio
          );

          if (!exists) {
              const nuevaSesion = {
                  fecha: fechaStr,
                  horaInicio: hm.horaInicio,
                  horaFin: hm.horaFin,
                  duracionMinutos: duracion
              };
              this.sesionesSeleccionadas.push(nuevaSesion);
              sesionesAgregadas.push(nuevaSesion);
          }
        }
      }
      this.mostrarMensajeFeedback(\`¡\${sesionesAgregadas.length} sesiones agregadas a tu plan recurrente!\`);
      // Limpiar selección temporal
      this.diasPlanSeleccionadosTemp = [];
      this.horariosMultiples = [];

    } else {
      if (!this.horarioTemporal.horaInicio || !this.horarioTemporal.horaFin) {
        this.mostrarMensajeFeedback('Debes seleccionar hora de inicio y fin');
        return;
      }
      const duracion = this.parseHora(this.horarioTemporal.horaFin) - this.parseHora(this.horarioTemporal.horaInicio);

      if (!this.diaSeleccionandoHorario) {
        this.mostrarMensajeFeedback('Debes seleccionar un día');
        return;
      }`;

content = content.replace(oldConfirmarParte1, newConfirmarParte1);

fs.writeFileSync(path, content);
console.log('Done replacement');
