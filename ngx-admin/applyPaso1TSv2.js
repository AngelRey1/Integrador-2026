const fs = require('fs');
let ts = fs.readFileSync('src/app/public/reserva-modal/reserva-modal.component.ts', 'utf8');

// The missing function calls are for `cargarHorariosParaDia` not `cargarHorasDisponiblesDia`
// `sesionesSeleccionadas` uses `SesionSeleccionada` with `fecha: string` and requires NO personas, but requires `duracionMinutos`.
// I will rewrite the replaced string to fix the TS bindings.

const regexAbrir = /abrirSelectorHorario\(dia: DiaCalendario\)\s*\{[\s\S]*?removerTodosSeleccionados\(\)\s*\{[\s\S]*?confirmarSesionTemporal\(\)\s*\{[\s\S]*?\n\s*\}/;

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

  removerTodosSeleccionados() {
    this.calendarioMes.forEach(semana => semana.forEach(d => d.seleccionado = false));
    this.diasPlanSeleccionadosTemp = [];
    this.horarioTemporal = { horaInicio: '', horaFin: '' };
  }

  confirmarSesionTemporal() {
    if (!this.horarioTemporal.horaInicio || !this.horarioTemporal.horaFin) return;
    
    // Obtener duracion (asumimos 60 min por defecto o calculamos)
    const [hI, mI] = this.horarioTemporal.horaInicio.split(':').map(Number);
    const [hF, mF] = this.horarioTemporal.horaFin.split(':').map(Number);
    const duracionMinutos = ((hF * 60 + mF) - (hI * 60 + mI)) || 60;
    
    if (this.usarPlanSemanal) {
      if (this.diasPlanSeleccionadosTemp.length === 0) return;
      
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
      
      this.aplicarPlanASesiones();
      this.removerTodosSeleccionados();
      
    } else {
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
    }
  }`;

if (regexAbrir.test(ts)) {
   ts = ts.replace(regexAbrir, nuevocodigo);
} else {
   console.log("No pude hacer match con la regex de los tres metodos!");
}

ts = ts.replace(/diasPlanSeleccionadosTemp\.length/, 'this.diasPlanSeleccionadosTemp.length');

fs.writeFileSync('src/app/public/reserva-modal/reserva-modal.component.ts', ts, 'utf8');
console.log("Completado");
