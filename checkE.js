
const fs = require("fs");
const html = fs.readFileSync("C:/Integrador-2026/ngx-admin/src/app/public/reserva-modal/reserva-modal.component.html", "utf8");
let stack = [];
let match;
const regex = /<\/?([a-zA-Z0-9\-]+)[^>]*>/g;
let lines = html.split("\n");
let count = 0;
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  let lineMatch;
  let re2 = /<\/?div[^>]*>/ig;
  while ((lineMatch = re2.exec(line)) !== null) {
     let tag = lineMatch[0];
     if (tag.toLowerCase().startsWith("</d")) {
       let p = stack.pop();
       // console.log(`Line ${i+1}: popped ${p} due to ${tag}`);
     } else {
       stack.push(tag);
       // console.log(`Line ${i+1}: pushed ${tag}`);
     }
  }
}
console.log("Remaining:");
stack.forEach(s => console.log(s));

