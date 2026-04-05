import { describe, it, expect } from "vitest";
import { jsonResponse } from "../../src/tools/index.js";

describe("jsonResponse", () => {
  it("wraps data in MCP text content format", () => {
    const result = jsonResponse({ a: 1 });
    expect(result).toEqual({
      content: [{ type: "text", text: '{\n  "a": 1\n}' }],
    });
  });

  it("handles arrays", () => {
    const result = jsonResponse([1, 2, 3]);
    expect(result).toEqual({
      content: [{ type: "text", text: '[\n  1,\n  2,\n  3\n]' }],
    });
  });

  it("handles null", () => {
    const result = jsonResponse(null);
    expect(result).toEqual({
      content: [{ type: "text", text: "null" }],
    });
  });
});
