
const fs = require("fs");
let html = fs.readFileSync("C:/Integrador-2026/ngx-admin/src/app/public/reserva-modal/reserva-modal.component.html", "utf8");
html = html.replace("<!-- SESIONES SELECCIONADAS (abajo) -->", "</div>\n\n        <!-- SESIONES SELECCIONADAS (abajo) -->");
fs.writeFileSync("C:/Integrador-2026/ngx-admin/src/app/public/reserva-modal/reserva-modal.component.html", html, "utf8");

