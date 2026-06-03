import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildChatApiUrl,
  encodePathSegment,
} from "@/services/chat/chatApiUtils.js";

const FLOWS_DIR = join(process.cwd(), "src/services/chat/flows");
const DYNAMIC_PATH_VARS = ["chatId", "messageId", "userId"];

function findUnencodedChatPathSegments(source, fileName) {
  const violations = [];
  const lines = source.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.includes("/chats/")) {
      continue;
    }
    for (const varName of DYNAMIC_PATH_VARS) {
      const bare = new RegExp(`\\$\\{${varName}\\}`);
      if (bare.test(line) && !line.includes(`encodeURIComponent(${varName})`)) {
        violations.push(`${fileName}:${i + 1} — unencoded \${${varName}} in chat path`);
      }
    }
  }
  return violations;
}

describe("chat flow URL encoding (SEC-03)", () => {
  it("encodePathSegment encodes reserved path characters", () => {
    expect(encodePathSegment("a/b?c#d")).toBe("a%2Fb%3Fc%23d");
    expect(encodePathSegment("-")).toBe("-");
  });

  it("buildChatApiUrl encodes dynamic segments and keeps static segments", () => {
    const url = buildChatApiUrl("http://localhost:3001", "chats", "x/y?z=1", "messages");
    expect(url).toBe("http://localhost:3001/chats/x%2Fy%3Fz%3D1/messages");
    expect(url).not.toContain("/x/y");
  });

  it("every chat flow file encodes dynamic path params in /chats/ URLs", () => {
    const files = readdirSync(FLOWS_DIR).filter((name) => name.endsWith(".js"));
    const violations = files.flatMap((fileName) => {
      const source = readFileSync(join(FLOWS_DIR, fileName), "utf8");
      return findUnencodedChatPathSegments(source, fileName);
    });
    expect(violations).toEqual([]);
  });
});
