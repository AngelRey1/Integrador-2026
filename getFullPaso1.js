
const fs = require("fs");
let html = fs.readFileSync("C:/Integrador-2026/ngx-admin/src/app/public/reserva-modal/reserva-modal.component.html", "utf8");

let startIdx = html.indexOf(`<!-- PASO 1: Fecha y Hora`);
let endIdx = html.indexOf(`<!-- PASO 2: Ubicación y Notas -->`);
console.log(html.substring(startIdx, startIdx + 100));
console.log(html.substring(endIdx - 100, endIdx));

