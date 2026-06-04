import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const FLOW_ROOTS = [
  "src/services/cart/flows",
  "src/services/bookings/flows",
  "src/services/events/flows",
  "src/services/orders/flows",
  "src/services/rental/flows",
];

const IMPORT_LINE =
  'import { buildFlowRequestOptions } from "@/services/flow-system/utils/buildFlowRequestOptions.js";\n';

function ensureImport(source) {
  if (source.includes("buildFlowRequestOptions")) return source;
  const lastImportIndex = source.lastIndexOf("\nimport ");
  if (lastImportIndex === -1) return source;
  const endOfLine = source.indexOf("\n", lastImportIndex + 1);
  return `${source.slice(0, endOfLine + 1)}${IMPORT_LINE}${source.slice(endOfLine + 1)}`;
}

function patchSource(source) {
  let next = ensureImport(source);

  next = next.replace(
    /,\s*headers:\s*context\.requestHeaders\s*\|\|\s*\{\},\s*signal:\s*context\.signal,\s*timeoutMs:\s*context\.requestTimeoutMs(?:\s*\|\|\s*\d+)?/g,
    "",
  );

  next = next.replace(
    /(\{\s*)(params:\s*)/g,
    (match, open, paramsKey) => {
      const before = next.slice(0, next.indexOf(match));
      const lineStart = before.lastIndexOf("\n") + 1;
      const line = before.slice(lineStart);
      if (!line.includes("await api.")) return match;
      if (match.includes("buildFlowRequestOptions")) return match;
      const windowStart = Math.max(0, before.length - 120);
      const window = before.slice(windowStart);
      if (window.includes("buildFlowRequestOptions")) return match;
      return `${open}...buildFlowRequestOptions(context), ${paramsKey}`;
    },
  );

  next = next.replace(
    /(\{\s*params:[^}]+\},)\s*signal:\s*context\.signal,\s*timeoutMs:\s*context\.requestTimeoutMs,?\s*\}/g,
    "{ ...buildFlowRequestOptions(context), $1 }",
  );

  next = next.replace(
    /headers:\s*context\.requestHeaders\s*\|\|\s*\{\},\s*signal:\s*context\.signal,\s*timeoutMs:\s*context\.requestTimeoutMs,?\s*\}/g,
    "...buildFlowRequestOptions(context) }",
  );

  next = next.replace(
    /\{\s*headers:\s*context\.requestHeaders,?\s*signal:\s*context\.signal,?\s*\}/g,
    "buildFlowRequestOptions(context)",
  );

  next = next.replace(
    /,\s*signal:\s*context\.signal,\s*timeoutMs:\s*context\.requestTimeoutMs/g,
    "",
  );

  const headersOnly = /const headers = context\.requestHeaders \|\| \{\};\n/g;
  if (headersOnly.test(next) && !next.includes("headers,") && !next.includes("headers\n")) {
    next = next.replace(headersOnly, "");
  }

  return next;
}

function listFlowFiles(dir) {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".js"))
    .map((name) => join(dir, name));
}

let patched = 0;
for (const root of FLOW_ROOTS) {
  for (const path of listFlowFiles(join(process.cwd(), root))) {
    const original = readFileSync(path, "utf8");
    if (!original.includes("context.signal")) continue;
    const updated = patchSource(original);
    if (updated !== original) {
      writeFileSync(path, updated);
      patched += 1;
    }
  }
}

console.log(`Pass 2 patched ${patched} files.`);
