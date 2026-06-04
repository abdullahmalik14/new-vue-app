import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const FLOW_ROOTS = [
  "src/services/cart/flows",
  "src/services/bookings/flows",
  "src/services/events/flows",
  "src/services/orders/flows",
  "src/services/rental/flows",
  "src/services/analytics/flows",
];

const IMPORT_LINE =
  'import { buildFlowRequestOptions } from "@/services/flow-system/utils/buildFlowRequestOptions.js";\n';

function ensureImport(source) {
  if (source.includes("buildFlowRequestOptions")) return source;
  const importRegex = /^import\s[\s\S]*?;\s*$/gm;
  let lastMatch = null;
  for (const match of source.matchAll(importRegex)) {
    lastMatch = match;
  }
  if (!lastMatch) return `${IMPORT_LINE}${source}`;
  const insertAt = lastMatch.index + lastMatch[0].length;
  return `${source.slice(0, insertAt)}${IMPORT_LINE}${source.slice(insertAt)}`;
}

function alreadyHasBuildOptions(snippet) {
  return snippet.includes("buildFlowRequestOptions");
}

function patchSource(source) {
  let next = source;

  // Standalone request options object (third arg or only arg)
  next = next.replace(
    /\{\s*headers:\s*context\.requestHeaders\s*\|\|\s*\{\},\s*signal:\s*context\.signal,\s*timeoutMs:\s*context\.requestTimeoutMs(?:\s*\|\|\s*\d+)?\s*\}/g,
    (match) => (alreadyHasBuildOptions(match) ? match : "buildFlowRequestOptions(context)"),
  );

  next = next.replace(
    /\{\s*headers,\s*signal:\s*context\.signal,\s*timeoutMs:\s*context\.requestTimeoutMs,?\s*\}/g,
    (match) => (alreadyHasBuildOptions(match) ? match : "buildFlowRequestOptions(context)"),
  );

  // params + headers/signal/timeout block
  next = next.replace(
    /(\{\s*)(params:\s*[^,]+),\s*headers(?:,\s*signal:\s*context\.signal,\s*timeoutMs:\s*context\.requestTimeoutMs)?/g,
    (match, open, paramsPart) => {
      if (alreadyHasBuildOptions(match)) return match;
      return `${open}...buildFlowRequestOptions(context), ${paramsPart}`;
    },
  );

  // params + signal/timeout only (no headers line)
  next = next.replace(
    /(\{\s*)(params:\s*[^,]+),\s*signal:\s*context\.signal,\s*timeoutMs:\s*context\.requestTimeoutMs/g,
    (match, open, paramsPart) => {
      if (alreadyHasBuildOptions(match)) return match;
      return `${open}...buildFlowRequestOptions(context), ${paramsPart}`;
    },
  );

  // api.get(url) single arg
  next = next.replace(/await api\.get\(([^,]+)\);/g, (match, url) => {
    if (alreadyHasBuildOptions(match)) return match;
    return `await api.get(${url}, buildFlowRequestOptions(context));`;
  });

  // api.post(url, body) two args
  next = next.replace(
    /await api\.post\(([^,]+),\s*(\{[^}]+\}|[^,)]+)\);/g,
    (match, url, body) => {
      if (alreadyHasBuildOptions(match)) return match;
      return `await api.post(${url}, ${body}, buildFlowRequestOptions(context));`;
    },
  );

  // api.patch(url, body) two args
  next = next.replace(
    /await api\.patch\(([^,]+),\s*([^,)]+)\);/g,
    (match, url, body) => {
      if (alreadyHasBuildOptions(match)) return match;
      return `await api.patch(${url}, ${body}, buildFlowRequestOptions(context));`;
    },
  );

  // api.delete(url) single arg
  next = next.replace(/await api\.delete\(([^,]+)\);/g, (match, url) => {
    if (alreadyHasBuildOptions(match)) return match;
    return `await api.delete(${url}, buildFlowRequestOptions(context));`;
  });

  return next;
}

function listFlowFiles(dir) {
  const entries = readdirSync(dir);
  const files = [];
  for (const name of entries) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isFile() && name.endsWith(".js")) {
      files.push(path);
    }
  }
  return files;
}

let patched = 0;
for (const root of FLOW_ROOTS) {
  const absRoot = join(process.cwd(), root);
  for (const path of listFlowFiles(absRoot)) {
    const original = readFileSync(path, "utf8");
    if (!original.includes("await api.")) continue;
    const updated = patchSource(ensureImport(original));
    if (updated !== original) {
      writeFileSync(path, updated);
      patched += 1;
    }
  }
}

console.log(`Patched ${patched} domain flow files.`);
