import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const REGISTRY_PATH = join(process.cwd(), "src/services/flow-system/flowRegistry.js");

const NO_REQUIRE_AUTH = new Set([
  "bookings.createTemporaryHold",
  "bookings.releaseTemporaryHold",
  "rental.flushClientCache",
  "cart.addItem",
  "cart.removeItem",
  "cart.updateQuantity",
  "cart.rename",
  "cart.applyCoupon",
  "cart.removeCoupon",
  "cart.applyFees",
  "cart.setAsDefault",
  "cart.mergeGuest",
  "cart.attachLiveData",
  "cart.remind",
]);

const source = readFileSync(REGISTRY_PATH, "utf8");
const entryPattern = /"([^"]+)":\s*\{[^}]*?flowKind:\s*"write"/gs;

let next = source;
let added = 0;

for (const match of source.matchAll(entryPattern)) {
  const flowName = match[1];
  if (NO_REQUIRE_AUTH.has(flowName)) continue;

  const key = `"${flowName}":`;
  const keyIndex = next.indexOf(key);
  if (keyIndex === -1) continue;

  const sliceFromKey = next.slice(keyIndex);
  if (sliceFromKey.includes("requireAuth:")) continue;

  const flowKindIndex = sliceFromKey.indexOf('flowKind: "write"');
  if (flowKindIndex === -1) continue;

  const insertAt = keyIndex + flowKindIndex + 'flowKind: "write"'.length;
  next = `${next.slice(0, insertAt)},\n    requireAuth: true${next.slice(insertAt)}`;
  added += 1;
}

writeFileSync(REGISTRY_PATH, next);
console.log(`Added requireAuth to ${added} write flows.`);
