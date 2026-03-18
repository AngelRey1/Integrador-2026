
const fs = require("fs");
let html = fs.readFileSync("C:/Integrador-2026/head.html", "utf8");
let s = html.indexOf(`<div class="col-calendario">`);
let e = html.indexOf(`<!-- COLUMNA DERECHA`);
if(s !== -1 && e !== -1) {
  let cal = html.substring(s, e);
  console.log("Found calendar chunk!");
  fs.writeFileSync("C:/Integrador-2026/cal.txt", cal, "utf8");
} else {
  console.log("Not found.");
}

