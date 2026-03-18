
const fs = require("fs");
const html = fs.readFileSync("C:/Integrador-2026/ngx-admin/src/app/public/reserva-modal/reserva-modal.component.html", "utf8");

let stack = [];
const tags = html.match(/<\/?([a-zA-Z0-9\-]+)[^>]*>/g) || [];

for (let i = 0; i < tags.length; i++) {
  let tag = tags[i];
  if (tag.startsWith("</")) {
    let name = tag.slice(2, -1).split(/\s+/)[0];
    if (name === "img" || name === "br" || name === "input" || name === "hr") continue;
    if (stack.length === 0) { console.log("Extra closing tag:", tag); break; }
    let last = stack.pop();
    if (last !== name) {
      console.log("Mismatch: Expected </" + last + "> but found", tag, "around tag index", i);
      console.log("Recent tags:", tags.slice(Math.max(0, i - 5), i + 5));
      break;
    }
  } else if (!tag.endsWith("/>")) {
    let name = tag.slice(1, -1).split(/\s+/)[0];
    if (name === "img" || name === "br" || name === "input" || name === "hr") continue;
    stack.push(name);
  }
}

