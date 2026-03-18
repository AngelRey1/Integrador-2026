const fs = require('fs');
let ts = fs.readFileSync('src/app/public/reserva-modal/reserva-modal.component.ts', 'utf8');

const regex = /confirmarSesionTemporal\(\)\s*\{[\s\S]*?\/\*\*\n   \* Cargar horarios disponibles del entrenador/;

const replacement = `confirmarSesionTemporal() {
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
  }

  /**
   * Cargar horarios disponibles del entrenador`;

ts = ts.replace(regex, replacement);
fs.writeFileSync('src/app/public/reserva-modal/reserva-modal.component.ts', ts, 'utf8');
console.log('Fixed dangling code');