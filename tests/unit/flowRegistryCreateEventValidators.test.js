import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  validateCreateEventPayload,
  validateCreateEventResponse,
} from "@/services/events/validators/eventFlowValidators.js";

const REGISTRY_PATH = join(process.cwd(), "src/services/flow-system/flowRegistry.js");

describe("events.createEvent validators (BUG-07)", () => {
  it("registers payload and response validators on events.createEvent", () => {
    const source = readFileSync(REGISTRY_PATH, "utf8");
    const block = source.slice(
      source.indexOf('"events.createEvent":'),
      source.indexOf('"events.fetchSpendingRequirementItems":'),
    );
    expect(block).toContain("validateCreateEventPayload");
    expect(block).toContain("validateCreateEventResponse");
  });

  it("validateCreateEventPayload rejects missing creatorId", () => {
    const result = validateCreateEventPayload({ title: "Test", type: "live" });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("creatorId"))).toBe(true);
  });

  it("validateCreateEventResponse requires eventId", () => {
    const result = validateCreateEventResponse({});
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("eventId"))).toBe(true);
  });
});
