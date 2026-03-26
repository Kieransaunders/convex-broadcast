import { describe, expect, test } from "vitest";
import { getLaunchDestination } from "./pwa-launch";

describe("getLaunchDestination", () => {
  test("sends authenticated users to inbox", () => {
    expect(getLaunchDestination("token")).toBe("/inbox");
  });

  test("sends signed-out users to sign-in", () => {
    expect(getLaunchDestination(null)).toBe("/sign-in");
  });
});
