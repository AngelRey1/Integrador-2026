
const fs = require("fs");
let p = fs.readFileSync("c:/Users/chuch/AppData/Roaming/Code/User/workspaceStorage/e41fb0a53cbc864f75e644d865df6c0c/GitHub.copilot-chat/chat-session-resources/e6b0117f-ae60-48b3-851d-67929898af5d/call_MHxZdlBpUXNqQ05mRERpMkNWMXo__vscode-1773798406218/content.txt", "utf8");
let lines = p.split("\n");
let out = [];
let start = false;
for(let l of lines) {
  if(l.startsWith("diff --git")) start = true;
  if(!start) continue;
  if(l.trim() === "```") continue; // remove any markdown fences if present
  out.push(l);
}
fs.writeFileSync("C:/Integrador-2026/diff-clean.patch", out.join("\n"), "utf8");

