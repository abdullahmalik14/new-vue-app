import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const REGISTRY_PATH = join(process.cwd(), "src/services/flow-system/flowRegistry.js");

describe("flowRegistry events.fetchEvent (BUG-01)", () => {
  it("registers events.fetchEvent only once", () => {
    const source = readFileSync(REGISTRY_PATH, "utf8");
    const matches = source.match(/"events\.fetchEvent":/g) || [];
    expect(matches).toHaveLength(1);
  });

  it("keeps pipeline config on the surviving registry entry", () => {
    const source = readFileSync(REGISTRY_PATH, "utf8");
    const block = source.slice(
      source.indexOf('"events.fetchEvent":'),
      source.indexOf('"events.fetchCreatorEvents":'),
    );
    expect(block).toContain("requestMs: 8000");
    expect(block).toContain("totalFlowMs: 10000");
    expect(block).toContain('policy: "latestWins"');
  });
});
