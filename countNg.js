
const fs = require("fs");
const html = fs.readFileSync("C:/Integrador-2026/ngx-admin/src/app/public/reserva-modal/reserva-modal.component.html", "utf8");
console.log("Open:", (html.match(/<ng-container/g)||[]).length);
console.log("Close:", (html.match(/<\/ng-container/g)||[]).length);

