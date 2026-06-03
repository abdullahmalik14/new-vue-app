import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const REGISTRY_PATH = join(process.cwd(), "src/services/flow-system/flowRegistry.js");

describe("events.fetchSpendingRequirementItems retry (BUG-05)", () => {
  it("uses maxAttempts 2 so one retry can run after a failed attempt", () => {
    const source = readFileSync(REGISTRY_PATH, "utf8");
    const block = source.slice(
      source.indexOf('"events.fetchSpendingRequirementItems":'),
      source.indexOf('"bookings.fetchCreatorBookingContext":'),
    );
    const retryBlock = block.slice(0, block.indexOf("concurrency:"));
    expect(retryBlock).toMatch(/maxAttempts:\s*2/);
    expect(retryBlock).not.toMatch(/maxAttempts:\s*1/);
  });
});
