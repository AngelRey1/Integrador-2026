
const fs = require("fs");
const html = fs.readFileSync("C:/Integrador-2026/ngx-admin/src/app/public/reserva-modal/reserva-modal.component.html", "utf8");

let stack = [];
let lines = html.split("\n");
const tags = [];
let match;
const regex = /<\/?([a-zA-Z0-9\-]+)[^>]*>/g;
while ((match = regex.exec(html)) !== null) {
  tags.push(match);
}

for (let i = 0; i < tags.length; i++) {
  let tag = tags[i][0];
  let name = tag.replace(/<\/?/, "").split(/[\s>]/)[0];
  if (name === "img" || name === "br" || name === "input" || name === "hr" || tag.endsWith("/>")) continue;
  
  if (tag.startsWith("</")) {
    if (stack.length === 0) continue;
    let last = stack.pop();
    if (last.name !== name) {
      console.log(`Mismatch: Expected </${last.name}> but found ${tag} (opening tag was ${last.tag})`);
      break;
    }
  } else {
    stack.push({name, tag});
  }
}
stack.forEach(s => console.log("Unclosed: ", s.tag));

