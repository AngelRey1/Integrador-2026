const fs = require('fs');
let ts = fs.readFileSync('src/app/public/reserva-modal/reserva-modal.component.ts', 'utf8');

// 1. Inject variable
ts = ts.replace('diaSeleccionandoHorario: DiaCalendario | null = null;', 'diaSeleccionandoHorario: DiaCalendario | null = null;\n  diasPlanSeleccionadosTemp: any[] = [];');

// 2. Replace abrirSelectorHorario
const regexAbrir = /abrirSelectorHorario\(dia: DiaCalendario\) \{[\s\S]*?\n  \/\*\*/;

const nuevocodigo = `abrirSelectorHorario(dia: DiaCalendario) {
    if (!dia.esMesActual || !dia.disponible) return;

    if (this.usarPlanSemanal) {
      dia.seleccionado = !dia.seleccionado;
      if (dia.seleccionado) {
        this.diasPlanSeleccionadosTemp.push(dia);
      } else {
        this.diasPlanSeleccionadosTemp = this.diasPlanSeleccionadosTemp.filter(d => d !== dia);
      }
      
      if (this.diasPlanSeleccionadosTemp.length > 0) {
        this.cargarHorariosParaDia(this.diasPlanSeleccionadosTemp[0].fecha);
      } else {
        this.horasDisponiblesDia = [];
        this.horasFinDisponiblesDia = [];
        this.horarioTemporal = { horaInicio: '', horaFin: '' };
      }
      this.actualizarConteoSesionesPlan();
    } else {
      this.calendarioMes.forEach(semana => semana.forEach(d => {
        if (d !== dia) d.seleccionado = false;
      }));
      dia.seleccionado = true;
      this.diasPlanSeleccionadosTemp = [dia];
      this.cargarHorariosParaDia(dia.fecha);
    }
  }

  cerrarSelectorHorario() {
    this.removerTodosSeleccionados();
  }

  removerTodosSeleccionados() {
    this.calendarioMes.forEach(semana => semana.forEach(d => d.seleccionado = false));
    this.diasPlanSeleccionadosTemp = [];
    this.horarioTemporal = { horaInicio: '', horaFin: '' };
  }

  confirmarSesionTemporal() {
    if (!this.horarioTemporal || !this.horarioTemporal.horaInicio || !this.horarioTemporal.horaFin) return;
    
    // Obtener duracion (asumimos 60 min por defecto o calculamos de this.horaSeleccionada o similar)
    const [hI, mI] = this.horarioTemporal.horaInicio.split(':').map(Number);
    const [hF, mF] = this.horarioTemporal.horaFin.split(':').map(Number);
    const duracionMinutos = ((hF * 60 + mF) - (hI * 60 + mI)) || ((this.horaSeleccionada || 1) * 60);
    
    if (this.usarPlanSemanal) {
      if (!this.diasPlanSeleccionadosTemp || this.diasPlanSeleccionadosTemp.length === 0) return;
      
      this.planConfig.horaGlobalInicio = this.horarioTemporal.horaInicio;
      this.planConfig.horaGlobalFin = this.horarioTemporal.horaFin;
      
      this.sesionesGeneradasPlan = [];
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      for (let semana = 0; semana < this.planConfig.duracion; semana++) {
        for (const d of this.diasPlanSeleccionadosTemp) {
           const fechaOriginal = d.fecha instanceof Date ? d.fecha : new Date(d.fecha);
           const fechaNueva = new Date(fechaOriginal);
           fechaNueva.setDate(fechaOriginal.getDate() + (semana * 7));
           
           if (fechaNueva <= hoy && semana === 0) continue;
           
           this.sesionesGeneradasPlan.push({
             fecha: this.formatearFechaISO(fechaNueva),
             horaInicio: this.planConfig.horaGlobalInicio,
             horaFin: this.planConfig.horaGlobalFin,
             duracionMinutos: duracionMinutos
           });
        }
      }
      
      this.actualizarConteoSesionesPlan();
      this.aplicarPlanASesiones();
      this.removerTodosSeleccionados();
      
    } else {
      if (!this.diasPlanSeleccionadosTemp || this.diasPlanSeleccionadosTemp.length === 0) return;
      const dia = this.diasPlanSeleccionadosTemp[0];
      const fechaStr = this.formatearFechaISO(dia.fecha);
      const yaExiste = this.sesionesSeleccionadas.some(s => s.fecha === fechaStr);
      
      if (!yaExiste) {
        this.sesionesSeleccionadas.push({
          fecha: fechaStr,
          horaInicio: this.horarioTemporal.horaInicio,
          horaFin: this.horarioTemporal.horaFin,
          duracionMinutos: duracionMinutos
        });
      }
      this.removerTodosSeleccionados();
      this.actualizarPrecioTotal();
    }
  }

  /**`;

if (regexAbrir.test(ts)) {
   ts = ts.replace(regexAbrir, nuevocodigo);
} else {
   console.log("No pude hacer match con la regex de abrirSelectorHorario!");
}

// 3. Fix onHoraInicioTemporalChange
ts = ts.replace(/!this\.diaSeleccionandoHorario/g, '(!this.diasPlanSeleccionadosTemp || this.diasPlanSeleccionadosTemp.length === 0)');
ts = ts.replace(/\bthis\.diaSeleccionandoHorario\.fecha/g, 'this.diasPlanSeleccionadosTemp[0].fecha');

// 4. Update access in actualizarConteoSesionesPlan
ts = ts.replace(/this\.getDiasSeleccionados\(\)\.length/g, '(this.diasPlanSeleccionadosTemp ? this.diasPlanSeleccionadosTemp.length : 0)');

// 5. Override togglePlanSemanal if needed
const regexToggle = /togglePlanSemanal\(\) \{[\s\S]*?\n  \/\*\*/;
const toggleCode = `togglePlanSemanal() {
    this.usarPlanSemanal = !this.usarPlanSemanal;
    this.removerTodosSeleccionados();
    if (!this.usarPlanSemanal) {
      this.planConfig = { duracion: 4, mismaHora: true, horaGlobalInicio: '', horaGlobalFin: '' };
      this.sesionesSeleccionadas = [];
      this.sesionesGeneradasPlan = [];
    }
    this.actualizarPrecioTotal();
  }

  /**`;
if (regexToggle.test(ts)) {
   ts = ts.replace(regexToggle, toggleCode);
} else {
   console.log("No match for togglePlanSemanal!");
}

// 6. Delete old duplicate of cerrarSelectorHorario using exact matching
const dupRegex = /cerrarSelectorHorario\(\) \{\r?\n\s*this\.diaSeleccionandoHorario\s*=\s*null;\r?\n\s*this\.horarioTemporal\s*=\s*\{\s*horaInicio:\s*'',\s*horaFin:\s*''\s*\};\r?\n\s*\}/;
if (dupRegex.test(ts)) {
    ts = ts.replace(dupRegex, '');
} else {
    console.log("No second duplicate match of cerrarSelectorHorario found");
}

fs.writeFileSync('src/app/public/reserva-modal/reserva-modal.component.ts', ts, 'utf8');
console.log("TS Clean Patch Completado");
