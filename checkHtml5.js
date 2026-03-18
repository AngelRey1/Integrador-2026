
const fs = require("fs");
const html = fs.readFileSync("C:/Integrador-2026/ngx-admin/src/app/public/reserva-modal/reserva-modal.component.html", "utf8");

let lines = html.split("\n");
let count = 0;
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  if (line.includes("<div")) count += (line.match(/<div/gi) || []).length;
  if (line.includes("</div")) count -= (line.match(/<\/div>/gi) || []).length;
}
console.log("Total remaining divs:", count);

