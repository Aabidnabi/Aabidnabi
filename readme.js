const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const readmePath = path.join(root, "README.md");
const profilePath = path.join(root, ".github", "terminal-profile.json");

const START_MARKER = "<!-- TERMINAL:START -->";
const END_MARKER = "<!-- TERMINAL:END -->";

const ESC = "\u001b[";

function color(code, text) {
  return `${ESC}${code}m${text}${ESC}0m`;
}

function prompt(profile) {
  const user = color("1;32", profile.username);
  const at = color("1;37", "@");
  const host = color("1;34", profile.host);
  const pathHome = color("1;36", "~");
  const dollar = color("1;37", "$ ");
  return `${user}${at}${host}:${pathHome}${dollar}`;
}

function label(text) {
  return color("1;36", text);
}

function value(text) {
  return color("1;37", text);
}

function terminalHeader(profile) {
  const controls = `${color("1;31", "●")} ${color("1;33", "●")} ${color("1;32", "●")}`;
  const title = color("1;37", `${profile.username} -- ${profile.host}`);
  const divider = color(
    "1;90",
    "------------------------------------------------------------",
  );
  return [`${controls}  ${title}`, divider];
}

function renderTerminal(profile) {
  const lines = [];
  lines.push(...terminalHeader(profile));
  lines.push("");
  lines.push(`${prompt(profile)}${color("1;33", profile.command)}`);
  lines.push("");
  lines.push(`${label("Name")}${color("1;90", " : ")}${value(profile.name)}`);
  lines.push(`${label("Role")}${color("1;90", " : ")}${value(profile.role)}`);
  lines.push("");
  lines.push(label("Focus:"));

  for (const item of profile.focus) {
    lines.push(`  ${color("1;32", "->")} ${value(item)}`);
  }

  lines.push("");
  lines.push(label("Interests:"));

  for (const item of profile.interests) {
    lines.push(`  ${color("1;34", "->")} ${value(item)}`);
  }

  lines.push("");
  lines.push(label("Quote:"));
  lines.push(color("1;33", `"${profile.quote}"`));
  lines.push("");
  lines.push(`${prompt(profile)}${color("1;92", "_")}`);

  return [
    START_MARKER,
    '<h3 align="center">💻 whoami terminal</h3>',
    "",
    "```ansi",
    ...lines,
    "```",
    END_MARKER,
    "",
  ].join("\n");
}

function main() {
  const profileRaw = fs.readFileSync(profilePath, "utf8");
  const profile = JSON.parse(profileRaw);

  const readme = fs.readFileSync(readmePath, "utf8");
  const start = readme.indexOf(START_MARKER);
  const end = readme.indexOf(END_MARKER);

  if (start === -1 || end === -1 || end < start) {
    throw new Error("Terminal markers not found in README.md");
  }

  const before = readme.slice(0, start);
  const after = readme.slice(end + END_MARKER.length);
  const replacement = renderTerminal(profile);
  const updated = `${before}${replacement}${after}`;

  if (updated !== readme) {
    fs.writeFileSync(readmePath, updated, "utf8");
    console.log("README terminal section updated.");
  } else {
    console.log("README terminal section already up-to-date.");
  }
}

main();
