import { ok } from "@/services/flow-system/flowTypes.js";

export async function flushRentalClientCacheFlow() {
  return ok(
    {
      flushed: true,
      flushedAt: Date.now(),
    },
    {
      flow: "rental.flushClientCache",
      source: "local-only",
    }
  );
}
