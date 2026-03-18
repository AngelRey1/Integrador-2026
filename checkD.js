
const fs = require("fs");
const html = fs.readFileSync("C:/Integrador-2026/ngx-admin/src/app/public/reserva-modal/reserva-modal.component.html", "utf8");
let stack = [];
let match;
const regex = /<\/?([a-zA-Z0-9\-]+)[^>]*>/g;
while ((match = regex.exec(html)) !== null) {
  let tag = match[0];
  let name = tag.replace(/<\/?/, "").split(/[\s>]/)[0];
  if (name === "img" || name === "br" || name === "input" || name === "hr" || tag.endsWith("/>")) continue;
  if(name === "div") {
    if(tag.startsWith("</")) {
      let popped = stack.pop();
    } else {
      stack.push(tag);
    }
  }
}
console.log("Unclosed DIVs:", stack.length);
stack.forEach(s => console.log(s));

