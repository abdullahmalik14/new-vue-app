import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const CHAT_FLOWS_DIR = join(process.cwd(), "src/services/chat/flows");
const IMPORT_LINE = 'import { buildFlowRequestOptions } from "@/services/flow-system/utils/buildFlowRequestOptions.js";\n';

function ensureImport(source) {
  if (source.includes("buildFlowRequestOptions")) return source;
  const lastImportIndex = source.lastIndexOf("\nimport ");
  if (lastImportIndex === -1) return source;
  const endOfLine = source.indexOf("\n", lastImportIndex + 1);
  return `${source.slice(0, endOfLine + 1)}${IMPORT_LINE}${source.slice(endOfLine + 1)}`;
}

function patchSource(source) {
  let next = source;
  next = next.replace(
    /await api\.post\(([^,]+),\s*([^,)]+)\);/g,
    "await api.post($1, $2, buildFlowRequestOptions(context));",
  );
  next = next.replace(
    /await api\.get\(([^,]+),\s*\{\s*params:\s*([^}]+)\s*\}\);/g,
    "await api.get($1, { ...buildFlowRequestOptions(context), params: $2 });",
  );
  next = next.replace(
    /await api\.get\(([^,]+)\);/g,
    "await api.get($1, buildFlowRequestOptions(context));",
  );
  next = next.replace(
    /await api\.patch\(([^,]+),\s*([^,)]+)\);/g,
    "await api.patch($1, $2, buildFlowRequestOptions(context));",
  );
  next = next.replace(
    /await api\.delete\(([^,]+)\);/g,
    "await api.delete($1, buildFlowRequestOptions(context));",
  );
  next = next.replace(
    /await api\.delete\(([^,]+),\s*(\{[^}]+\})\);/g,
    "await api.delete($1, { ...buildFlowRequestOptions(context), ...$2 });",
  );
  return next;
}

let patched = 0;
for (const file of readdirSync(CHAT_FLOWS_DIR).filter((name) => name.endsWith(".js"))) {
  const path = join(CHAT_FLOWS_DIR, file);
  const original = readFileSync(path, "utf8");
  if (!original.includes("await api.")) continue;
  let updated = patchSource(ensureImport(original));
  if (updated !== original) {
    writeFileSync(path, updated);
    patched += 1;
  }
}

console.log(`Patched ${patched} chat flow files.`);
