
const fs = require("fs");
let html = fs.readFileSync("C:/Integrador-2026/ngx-admin/src/app/public/reserva-modal/reserva-modal.component.html", "utf8");
html = html.replace("</ng-container>\n\n<!-- Personas -->", "</ng-container>\n</div>\n<!-- Personas -->");
fs.writeFileSync("C:/Integrador-2026/ngx-admin/src/app/public/reserva-modal/reserva-modal.component.html", html, "utf8");

