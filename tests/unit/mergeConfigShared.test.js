import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { mergeConfig } from "@/services/flow-system/utils/mergeConfig.js";

describe("shared mergeConfig (PERF-05)", () => {
  it("deep-merges nested pipeline config", () => {
    const merged = mergeConfig(
      { retry: { enabled: true, maxAttempts: 2 } },
      { retry: { maxAttempts: 3 }, etag: { enabled: true } },
    );
    expect(merged.retry).toEqual({ enabled: true, maxAttempts: 3 });
    expect(merged.etag).toEqual({ enabled: true });
  });

  it("pipelineContext and readSourceRuntime import shared mergeConfig", () => {
    const pipelineContext = readFileSync(
      join(process.cwd(), "src/services/flow-system/pipeline/pipelineContext.js"),
      "utf8",
    );
    const readSourceRuntime = readFileSync(
      join(process.cwd(), "src/services/flow-system/runtime/readSourceRuntime.js"),
      "utf8",
    );
    expect(pipelineContext).toContain('from "@/services/flow-system/utils/mergeConfig.js"');
    expect(readSourceRuntime).toContain('from "@/services/flow-system/utils/mergeConfig.js"');
    expect(pipelineContext).not.toMatch(/function mergeConfig\(/);
    expect(readSourceRuntime).not.toMatch(/function mergeConfig\(/);
  });
});
