// tools/gen-emotes.js
// Generates assets/js/data/emotes.js from assets/ui/emotes/*.gif

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const EMOTE_DIR = path.join(ROOT, "assets", "ui", "emotes");
const OUT_FILE = path.join(ROOT, "assets", "js", "data", "emotes.js");

function titleize(id) {
  return id
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function main() {
  if (!fs.existsSync(EMOTE_DIR)) {
    console.error("Emote folder not found:", EMOTE_DIR);
    process.exit(1);
  }

  const files = fs
    .readdirSync(EMOTE_DIR, { withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => d.name)
    .filter((n) => /\.gif$/i.test(n))
    .sort((a, b) => a.localeCompare(b));

  const items = files.map((filename) => {
    const id = filename.replace(/\.gif$/i, "");
    return {
      id,
      name: titleize(id),
      src: `assets/ui/emotes/${filename}`,
      tags: [],
    };
  });

  const out = `(function () {
  window.AOC = window.AOC || {};
  window.AOC.DATA = window.AOC.DATA || {};

  // AUTO-GENERATED. Do not edit by hand.
  window.AOC.DATA.EMOTES = ${JSON.stringify(items, null, 2)};
})();\n`;

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, out, "utf8");

}

main();
