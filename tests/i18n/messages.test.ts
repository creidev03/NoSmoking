import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("message files", () => {
  it("messages/es.json exists and is valid JSON", () => {
    const content = readFileSync(join(process.cwd(), "messages/es.json"), "utf-8");
    const parsed = JSON.parse(content);
    expect(typeof parsed).toBe("object");
  });

  it("messages/en.json exists and is valid JSON", () => {
    const content = readFileSync(join(process.cwd(), "messages/en.json"), "utf-8");
    const parsed = JSON.parse(content);
    expect(typeof parsed).toBe("object");
  });
});
