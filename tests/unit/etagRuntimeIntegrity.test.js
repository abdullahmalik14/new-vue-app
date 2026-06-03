import { describe, expect, it } from "vitest";
import {
  loadEtag,
  saveEtag,
  sealEtagRecord,
  unsealEtagRecord,
} from "@/services/flow-system/runtime/etagRuntime.js";

describe("etagRuntime integrity (SEC-04)", () => {
  it("rejects tampered localStorage ETag records", () => {
    const storage = {
      data: {},
      getItem(key) {
        return this.data[key] ?? null;
      },
      setItem(key, value) {
        this.data[key] = value;
      },
    };

    saveEtag({ storage, key: "k1", etag: '"abc"' });
    const raw = storage.getItem("k1");
    const tampered = JSON.parse(raw);
    tampered.etag = '"evil"';
    storage.setItem("k1", JSON.stringify(tampered));

    expect(loadEtag({ storage, key: "k1" })).toBeNull();
  });

  it("rejects legacy plain-string ETag values", () => {
    const storage = {
      data: { k2: '"legacy"' },
      getItem(key) {
        return this.data[key] ?? null;
      },
      setItem(key, value) {
        this.data[key] = value;
      },
    };

    expect(loadEtag({ storage, key: "k2" })).toBeNull();
  });

  it("seal/unseal round-trip matches session-bound digest", () => {
    const nonce = "session-nonce";
    const key = "flow:hash";
    const etag = '"etag-value"';
    const sealed = sealEtagRecord({ nonce, key, etag });
    expect(unsealEtagRecord(sealed, { nonce, key })).toBe(etag);
    expect(unsealEtagRecord(sealed, { nonce: "other", key })).toBeNull();
  });
});
