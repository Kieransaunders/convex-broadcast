import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import schema from "../schema";
import { api } from "../_generated/api";

const t = convexTest(schema, import.meta.glob("../**/*.ts"));

test("getVapidPublicKey returns null when env var not set", async () => {
  const result = await t.query(api.push.getVapidPublicKey, {});
  expect(result).toBeNull();
});

test("subscribe throws when unauthenticated", async () => {
  await expect(
    t.mutation(api.push.subscribe, {
      endpoint: "https://push.example.com/subscription/abc123",
      p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlTiaTiTSfacx8pHQTk1bFVZZB9WPB0lBzCMbJmI",
      auth: "tBHItJI5svbpez7KI4CCXg",
      preference: "all",
    }),
  ).rejects.toThrow();
});

test("getMySubscription throws when unauthenticated", async () => {
  await expect(t.query(api.push.getMySubscription, {})).rejects.toThrow();
});
