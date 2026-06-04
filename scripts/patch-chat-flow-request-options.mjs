import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const CHAT_FLOWS_DIR = join(process.cwd(), "src/services/chat/flows");
const IMPORT_LINE =
  'import { buildFlowRequestOptions } from "@/services/flow-system/utils/buildFlowRequestOptions.js";\n';

function ensureImport(source) {
  if (source.includes("buildFlowRequestOptions")) return source;
  const lastImportIndex = source.lastIndexOf("\nimport ");
  if (lastImportIndex === -1) return source;
  const endOfLine = source.indexOf("\n", lastImportIndex + 1);
  return `${source.slice(0, endOfLine + 1)}${IMPORT_LINE}${source.slice(endOfLine + 1)}`;
}

function alreadyHasBuildOptions(callSnippet) {
  return callSnippet.includes("buildFlowRequestOptions");
}

function patchSource(source) {
  let next = source;

  // api.get(url, { params }) without buildFlowRequestOptions
  next = next.replace(
    /await api\.get\(([^,]+),\s*(\{[^}]*params[^}]*\})\s*\);/g,
    (match, url, opts) => {
      if (alreadyHasBuildOptions(match)) return match;
      if (opts.includes("buildFlowRequestOptions")) return match;
      return `await api.get(${url}, { ...buildFlowRequestOptions(context), ...${opts} });`;
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

  // api.delete(url, { ...spread }) — merge buildFlowRequestOptions first
  next = next.replace(
    /await api\.delete\(([^,]+),\s*(\{[^}]+\})\);/g,
    (match, url, opts) => {
      if (alreadyHasBuildOptions(match)) return match;
      if (opts.includes("buildFlowRequestOptions")) return match;
      return `await api.delete(${url}, { ...buildFlowRequestOptions(context), ...${opts} });`;
    },
  );

  return next;
}

let patched = 0;
for (const file of readdirSync(CHAT_FLOWS_DIR).filter((name) => name.endsWith(".js"))) {
  const path = join(CHAT_FLOWS_DIR, file);
  const original = readFileSync(path, "utf8");
  if (!original.includes("await api.")) continue;
  const updated = patchSource(ensureImport(original));
  if (updated !== original) {
    writeFileSync(path, updated);
    patched += 1;
  }
}

console.log(`Patched ${patched} chat flow files.`);
