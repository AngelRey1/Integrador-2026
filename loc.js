const fs = require('fs');
let html = fs.readFileSync('C:/Integrador-2026/ngx-admin/src/app/public/reserva-modal/reserva-modal.component.html', 'utf8');
const p1 = html.indexOf('<div class=\"dia-config');
const p2 = html.indexOf('<!-- Personas -->');
console.log(p1, p2);
