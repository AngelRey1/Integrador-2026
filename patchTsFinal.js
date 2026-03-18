
const fs = require('fs');
let ts = fs.readFileSync('C:/Integrador-2026/ngx-admin/src/app/public/reserva-modal/reserva-modal.component.ts', 'utf8');

if (!ts.includes('diasPlanSeleccionadosTemp')) {
  ts = ts.replace('diaSeleccionandoHorario: any = null;', 'diaSeleccionandoHorario: any = null;\n  diasPlanSeleccionadosTemp: any[] = [];');
}

const abrirSelectorSrc = [
  'abrirSelectorHorario(dia: DiaCalendario) {',
  '  if (!dia.esMesActual || !dia.disponible) return;',
  '',
  '  if (this.usarPlanSemanal) {',
  '    dia.seleccionado = !dia.seleccionado;',
  '    if (dia.seleccionado) {',
  '      this.diasPlanSeleccionadosTemp.push(dia);',
  '    } else {',
  '      this.diasPlanSeleccionadosTemp = this.diasPlanSeleccionadosTemp.filter(d => d !== dia);',
  '    }',
  '    ',
  '    if (this.diasPlanSeleccionadosTemp.length > 0) {',
  '      this.cargarHorasDisponiblesDia(this.diasPlanSeleccionadosTemp[0].fecha);',
  '    } else {',
  '      this.horasDisponiblesDia = [];',
  '      this.horasFinDisponiblesDia = [];',
  '      this.horarioTemporal = { horaInicio: '''', horaFin: '''' };',
  '    }',
  '    this.actualizarConteoSesionesPlan();',
  '  } else {',
  '    this.calendarioMes.forEach(semana => semana.forEach(d => {',
  '      if (d !== dia) d.seleccionado = false;',
  '    }));',
  '    dia.seleccionado = true;',
  '    this.diasPlanSeleccionadosTemp = [dia];',
  '    this.cargarHorasDisponiblesDia(dia.fecha);',
  '  }',
  '}',
  '',
  'removerTodosSeleccionados() {',
  '  this.calendarioMes.forEach(semana => semana.forEach(d => d.seleccionado = false));',
  '  this.diasPlanSeleccionadosTemp = [];',
  '  this.horarioTemporal = { horaInicio: '''', horaFin: '''' };',
  '}',
  '',
  'confirmarSesionTemporal() {',
  '  if (!this.horarioTemporal.horaInicio || !this.horarioTemporal.horaFin) return;',
  '  ',
  '  if (this.usarPlanSemanal) {',
  '    if (this.diasPlanSeleccionadosTemp.length === 0) return;',
  '    ',
  '    this.planConfig.horaGlobalInicio = this.horarioTemporal.horaInicio;',
  '    this.planConfig.horaGlobalFin = this.horarioTemporal.horaFin;',
  '    ',
  '    this.sesionesGeneradasPlan = [];',
  '    const hoy = new Date();',
  '    hoy.setHours(0, 0, 0, 0);',
  '    ',
  '    for (let semana = 0; semana < this.planConfig.duracion; semana++) {',
  '      for (const d of this.diasPlanSeleccionadosTemp) {',
  '         const fechaOriginal = d.fecha as Date;',
  '         const fechaNueva = new Date(fechaOriginal);',
  '         fechaNueva.setDate(fechaOriginal.getDate() + (semana * 7));',
  '         ',
  '         if (fechaNueva <= hoy && semana === 0) continue;',
  '         ',
  '         this.sesionesGeneradasPlan.push({',
  '           fecha: fechaNueva,',
  '           horaInicio: this.planConfig.horaGlobalInicio,',
  '           horaFin: this.planConfig.horaGlobalFin,',
  '           personas: this.paso1Form.get(''cantidadPersonas'')?.value || 1',
  '         });',
  '      }',
  '    }',
  '    ',
  '    this.aplicarPlanASesiones();',
  '    this.removerTodosSeleccionados();',
  '    ',
  '  } else {',
  '    const dia = this.diasPlanSeleccionadosTemp[0];',
  '    const yaExiste = this.sesionesSeleccionadas.some(s => s.fecha.getTime() === dia.fecha.getTime());',
  '    ',
  '    if (!yaExiste) {',
  '      this.sesionesSeleccionadas.push({',
  '        fecha: dia.fecha,',
  '        horaInicio: this.horarioTemporal.horaInicio,',
  '        horaFin: this.horarioTemporal.horaFin,',
  '        personas: this.paso1Form.get(''cantidadPersonas'')?.value || 1',
  '      });',
  '    }',
  '    this.removerTodosSeleccionados();',
  '  }',
  '}',
  '',
  '/**'
].join('\n');

ts = ts.replace(/abrirSelectorHorario\(dia: DiaCalendario\) \{[\s\S]*?\n  \/\*\*/, abrirSelectorSrc);


const cerrarSrc = [
  'cerrarSelectorHorario() {',
  '  this.removerTodosSeleccionados();',
  '}',
  '',
  '/**'
].join('\n');
ts = ts.replace(/cerrarSelectorHorario\(\) \{[\s\S]*?\n  \/\*\*/, cerrarSrc);

const toggleSrc = [
  'togglePlanSemanal() {',
  '  this.usarPlanSemanal = !this.usarPlanSemanal;',
  '  this.removerTodosSeleccionados();',
  '  if (!this.usarPlanSemanal) {',
  '    this.planConfig = { duracion: 4, mismaHora: true, horaGlobalInicio: '''', horaGlobalFin: '''' };',
  '  }',
  '  this.actualizarConteoSesionesPlan();',
  '}',
  '',
  '/**'
].join('\n');
ts = ts.replace(/togglePlanSemanal\(\) \{[\s\S]*?\n  \/\*\*/, toggleSrc);

ts = ts.replace(/getDiasSeleccionados\(\)\.length/g, 'diasPlanSeleccionadosTemp.length');

fs.writeFileSync('C:/Integrador-2026/ngx-admin/src/app/public/reserva-modal/reserva-modal.component.ts', ts, 'utf8');
console.log('TS reescrito exitosamente!');

