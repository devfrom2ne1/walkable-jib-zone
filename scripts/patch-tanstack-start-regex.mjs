import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);

const fixed = String.raw`new RegExp(resolvedGeneratedRouteTreePath.replace(/[.*+?^\${}()|[\]\\]/g, "\\$&"))`;

let packageDir;

try {
  packageDir = dirname(require.resolve("@tanstack/start-plugin-core/package.json"));
} catch {
  console.warn("[patch-tanstack-start-regex] @tanstack/start-plugin-core is not installed yet.");
  process.exit(0);
}

const targets = [
  {
    path: join(packageDir, "dist/esm/vite/start-router-plugin/plugin.js"),
    replacement: `\t\t\tclientTreePlugin.load.filter = { id: { include: ${fixed} } };`,
  },
  {
    path: join(packageDir, "src/vite/start-router-plugin/plugin.ts"),
    replacement: `        id: { include: ${fixed} },`,
  },
];

for (const { path: target, replacement } of targets) {
  if (!existsSync(target)) continue;

  const source = readFileSync(target, "utf8");
  const lines = source.split("\n");
  const lineIndex = lines.findIndex(
    (line) =>
      line.includes("include:") &&
      line.includes("resolvedGeneratedRouteTreePath"),
  );

  if (lineIndex === -1) {
    console.warn(`[patch-tanstack-start-regex] Pattern not found in ${target}`);
    continue;
  }

  if (lines[lineIndex] === replacement) continue;

  lines[lineIndex] = replacement;
  writeFileSync(target, lines.join("\n"));
  console.log(`[patch-tanstack-start-regex] Patched ${target}`);
}
