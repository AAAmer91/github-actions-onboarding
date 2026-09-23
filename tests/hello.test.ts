import { describe, expect, it } from "@jest/globals";

import { hello } from "../src/hello.js";

describe("hello", () => {
  it("greets the supplied name", () => {
    expect(hello("Developer")).toBe("Hello, Developer!");
  });

  it("uses World when the name is missing", () => {
    expect(hello()).toBe("Hello, World!");
  });

  it("uses World when the name contains only whitespace", () => {
    expect(hello("   ")).toBe("Hello, World!");
  });

  it("trims surrounding whitespace", () => {
    expect(hello("  Developer  ")).toBe("Hello, Developer!");
  });
});

