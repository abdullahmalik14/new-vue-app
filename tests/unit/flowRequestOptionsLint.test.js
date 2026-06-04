import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const SERVICES_ROOT = join(process.cwd(), "src/services");

const EXEMPT_FILES = new Set([
  "mediaUploaderFlows.js",
  "getAllCartsFlow.js",
]);

const EXEMPT_DIRS = new Set([
  "analytics",
]);

function listFlowFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      if (name === "flows") {
        for (const file of readdirSync(path).filter((f) => f.endsWith(".js"))) {
          acc.push(join(path, file));
        }
      } else if (!name.startsWith(".")) {
        listFlowFiles(path, acc);
      }
    }
  }
  return acc;
}

function relativePath(absPath) {
  return absPath.replace(/\\/g, "/").replace(`${SERVICES_ROOT.replace(/\\/g, "/")}/`, "");
}

describe("flow request options lint (FEAT-11)", () => {
  it("api-based flow files use buildFlowRequestOptions(context)", () => {
    const hasApiCall = /await api\.(get|post|patch|put|delete)\(/;
    const violations = [];

    for (const filePath of listFlowFiles(SERVICES_ROOT)) {
      const rel = relativePath(filePath);
      const domain = rel.split("/")[0];
      if (EXEMPT_DIRS.has(domain)) continue;

      const fileName = rel.split("/").pop();
      if (EXEMPT_FILES.has(fileName)) continue;

      const source = readFileSync(filePath, "utf8");
      if (!hasApiCall.test(source)) continue;
      if (!source.includes("buildFlowRequestOptions(context)")) {
        violations.push(`${rel} — missing buildFlowRequestOptions(context)`);
      }
      if (/context\.signal/.test(source)) {
        violations.push(`${rel} — still hand-rolls context.signal`);
      }
    }

    expect(violations).toEqual([]);
  });
});
