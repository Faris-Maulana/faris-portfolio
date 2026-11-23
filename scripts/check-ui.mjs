#!/usr/bin/env node
// UI copy + token discipline validator. Zero dependencies, portable to any repo.
//   node validate.mjs <file-or-dir> [...]
// Exit 1 if any error-level finding. Warnings do not fail the run.
//
// Skips node_modules, .next, dist, build, .git, and any path containing
// "tokens", "theme", "palette", or "globals.css" for the raw-color check
// (those files are where colors are SUPPOSED to live).

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, basename, extname } from "node:path";

const SKIP_DIRS = new Set(["node_modules", ".next", "dist", "build", ".git", "coverage", ".turbo"]);
const CODE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".css", ".scss", ".html", ".md"]);
const THEME_HINT = /tokens|theme|palette|globals\.css|design-system|tailwind\.config/i;

// Emoji: pictographic ranges. Deliberately excludes ™ © ® and plain symbols.
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{1F000}-\u{1F2FF}\u{2600}-\u{27BF}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/u;
const DASH = /[—–]/;              // em-dash, en-dash
const HEX = /#[0-9a-fA-F]{3,8}\b/;
const RGB = /\b(?:rgba?|hsla?)\s*\(/;
const IMPORTANT = /!important/;
const INLINE_STYLE = /style=\{\{[^}]*(?:color|background|padding|margin|fontSize|width|height)/;
const PX_HEIGHT = /\bh(?:eight)?-\[\d+px\]|height:\s*\d+px/;
const DARK_VARIANT = /\bdark:/;

const findings = [];
const files = [];

function walk(p) {
  let st;
  try { st = statSync(p); } catch { return; }
  if (st.isDirectory()) {
    if (SKIP_DIRS.has(basename(p))) return;
    for (const e of readdirSync(p)) walk(join(p, e));
  } else if (CODE_EXT.has(extname(p))) {
    files.push(p);
  }
}

function add(level, file, line, rule, msg) {
  findings.push({ level, file, line, rule, msg });
}

for (const arg of process.argv.slice(2)) walk(arg);

if (files.length === 0) {
  console.error("validate.mjs: no matching files. Pass a file or directory.");
  process.exit(2);
}

for (const file of files) {
  let text;
  try { text = readFileSync(file, "utf8"); } catch { continue; }
  const isTokenFile = THEME_HINT.test(file);
  const isMarkdown = extname(file) === ".md";
  const hasDark = DARK_VARIANT.test(text);
  const lines = text.split("\n");

  let sawHexOutsideToken = false;

  lines.forEach((raw, i) => {
    const n = i + 1;
    const line = raw;

    // Ignore obvious non-UI lines for copy rules.
    const isComment = /^\s*(\/\/|\/\*|\*|#|\{\/\*)/.test(line);
    // ONLY module-specifier lines. A naive /^(import|export)\s/ also swallows
    // `export const Foo = () => <p>copy</p>`, which is exactly where copy lives.
    const isImport =
      /^\s*import\s/.test(line) || /^\s*export\s[^=]*\bfrom\s*['"]/.test(line);

    // For copy rules, strip comment tails so a dash written to the next engineer
    // is not reported as user-visible copy.
    const copy = line
      .replace(/\{\/\*[\s\S]*?(\*\/\}|$)/g, "")  // JSX comment, possibly unterminated
      .replace(/\/\*[\s\S]*?(\*\/|$)/g, "")      // block comment
      .replace(/\/\/.*$/, "");                   // trailing line comment

    if (!isComment && EMOJI.test(copy)) {
      add("error", file, n, "emoji", "emoji in user-visible copy; use a lucide/heroicons icon instead");
    }
    // Dashes are only a defect in copy the user reads. Code comments are the
    // author talking to the next engineer, so they are explicitly out of scope —
    // flagging them buries the real findings in noise.
    if (!isImport && !isComment && DASH.test(copy)) {
      add(isMarkdown ? "warn" : "error", file, n, "dash",
        "em/en-dash in user-visible copy; use a comma, colon, or parentheses");
    }
    if (!isTokenFile && !isComment && HEX.test(line)) {
      sawHexOutsideToken = true;
      add("error", file, n, "raw-color", "hard-coded hex outside a token/theme file; breaks theming");
    }
    if (!isTokenFile && !isComment && RGB.test(line)) {
      add("error", file, n, "raw-color", "hard-coded rgb/hsl outside a token/theme file");
    }
    if (IMPORTANT.test(line)) {
      add("error", file, n, "important", "!important is a specificity fight; fix the cascade");
    }
    if (INLINE_STYLE.test(line)) {
      add("warn", file, n, "inline-style", "inline style bypasses the token layer");
    }
    if (PX_HEIGHT.test(line)) {
      add("warn", file, n, "fixed-height", "fixed px height on a text container breaks at zoom/locale");
    }
  });

  if (hasDark && sawHexOutsideToken) {
    add("error", file, 1, "half-dark-mode",
      "file uses dark: variants AND hard-coded colors; dark mode will be inconsistent");
  }
}

const errors = findings.filter((f) => f.level === "error");
const warns = findings.filter((f) => f.level === "warn");

for (const f of [...errors, ...warns]) {
  console.log(`${f.level === "error" ? "ERR " : "warn"} ${f.file}:${f.line}  [${f.rule}] ${f.msg}`);
}

console.log(
  `\n${files.length} file(s) checked — ${errors.length} error(s), ${warns.length} warning(s)`
);
if (errors.length) {
  console.log("Design-system errors are blocking. Fix them or justify each one explicitly.");
}
process.exit(errors.length ? 1 : 0);
