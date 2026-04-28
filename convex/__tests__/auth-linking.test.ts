import { expect, test } from "vitest";
import { resolveProjectUserLink } from "../auth-linking";

test("resolveProjectUserLink falls back to email when the linked user is stale", async () => {
  const result = await resolveProjectUserLink({
    authUser: {
      authRecordId: "auth_123",
      linkedUserId: "users_missing",
      email: "member@example.com",
    },
    getById: async () => null,
    getByEmail: async (email) =>
      email === "member@example.com"
        ? {
            _id: "users_1",
            email,
            authUserId: undefined,
          }
        : null,
    getUserId: (user) => user._id,
    getUserAuthRecordId: (user) => user.authUserId,
  });

  expect(result).toEqual({
    user: {
      _id: "users_1",
      email: "member@example.com",
      authUserId: undefined,
    },
    resolvedBy: "email",
    needsRepair: true,
  });
});
