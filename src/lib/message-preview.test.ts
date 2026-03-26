import { describe, expect, test } from "vitest";
import { getMessagePreview } from "./message-preview";

describe("getMessagePreview", () => {
  test("strips common markdown formatting for feed previews", () => {
    expect(
      getMessagePreview("## **Update**\n\nPlease read the [guide](https://example.com)."),
    ).toBe("Update Please read the guide.");
  });

  test("collapses repeated whitespace", () => {
    expect(getMessagePreview("Line one\n\nLine two\t\tline three")).toBe(
      "Line one Line two line three",
    );
  });
});
