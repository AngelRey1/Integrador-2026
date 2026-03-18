const fs = require('fs');
let html = fs.readFileSync('src/app/public/reserva-modal/reserva-modal.component.html', 'utf8');

const unificadoStart = html.indexOf('<div class="reserva-layout-unificado">');
const resumenIndex = html.indexOf('<!-- Resumen inferior (siempre visible en Paso 1)');

let preUnificado = html.substring(0, unificadoStart);
let extractUnificado = html.substring(unificadoStart, resumenIndex);
let postUnificado = html.substring(resumenIndex);

const calStart = extractUnificado.indexOf('<!-- COLUMNA IZQUIERDA: Calendario compacto -->');
const panelStart = extractUnificado.indexOf('<!-- COLUMNA DERECHA: Panel de opciones -->');

const calStr = extractUnificado.substring(calStart, panelStart);
const panelStr = extractUnificado.substring(panelStart);

const configManualStart = panelStr.indexOf('<!-- Configuración manual (si el plan está inactivo) -->');

// Let's ensure we find the end of toggleStr properly. Actually toggleStr just goes up to configManualStart.
const toggleStrRaw = panelStr.substring(0, configManualStart);
// But wait, the configManual is inside `.panel-plan`! 
// Let's verify the nesting:
// <div class="col-panel">
//   <div class="panel-plan">
//      ... toggle and plan-config ...
//      <div class="config-manual" *ngIf="!usarPlanSemanal"> ... </div>
//   </div>
// </div>

// So config-manual is a sibling of plan-config, inside panel-plan!
// We want:
// Top:
// <div class="col-panel w-100">
//   <div class="panel-plan"> ... toggle and plan-config ... </div>
// </div>
// Middle: calStr
// Bottom:
// <div class="col-panel w-100">
//   <div class="panel-plan"> <div class="config-manual"> ... </div> </div>
// </div>

// Let's just use string replace to do exactly this.

// Let's extract exactly the parts we need using regex or substring
const topBlock = toggleStrRaw.replace('<div class="col-panel">', '<div class="col-panel" style="width: 100%; margin-bottom: 20px;">') + '</div></div>\n';

const calBlock = calStr.replace('<div class="col-calendario">', '<div class="col-calendario" style="width: 100%; margin-bottom: 20px;">');

const bottomBlock = '<div class="col-panel" style="width: 100%; margin-top: 20px;">\n<div class="panel-plan">\n' + panelStr.substring(configManualStart);
// We might have an extra </div> or two at the end of bottomBlock...
// Let's just output it and see.

let newHtml = preUnificado + '<div class="reserva-layout-unificado" style="display: flex; flex-direction: column; align-items: center;">\n' + topBlock + calBlock + bottomBlock + postUnificado;

fs.writeFileSync('src/app/public/reserva-modal/reserva-modal.component.html', newHtml, 'utf8');
console.log("HTML reordered");
