
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
  while ((lineMatch = regex.exec(line)) !== null) {
     let tag = lineMatch[0];
     let name = tag.replace(/<\/?/, "").split(/[\s>]/)[0];
     if (name === "img" || name === "br" || name === "input" || name === "hr" || tag.endsWith("/>")) continue;
     if (tag.startsWith("</")) {
       let last = stack.pop();
       if(last && last.name !== name) {
          console.log(`Line ${i+1}: Mismatch. Popped <${name}> but expected to close <${last.name}> (from line ${last.line})`);
          // uncomment to break on first error: console.process.exit(1);
       }
     } else {
       stack.push({name, tag, line: i+1});
     }
  }
}

