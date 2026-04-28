/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as debugAuth from "../debugAuth.js";
import type * as email from "../email.js";
import type * as events from "../events.js";
import type * as groups from "../groups.js";
import type * as http from "../http.js";
import type * as impersonation from "../impersonation.js";
import type * as invites from "../invites.js";
import type * as messages from "../messages.js";
import type * as push from "../push.js";
import type * as pushActions from "../pushActions.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  crons: typeof crons;
  debugAuth: typeof debugAuth;
  email: typeof email;
  events: typeof events;
  groups: typeof groups;
  http: typeof http;
  impersonation: typeof impersonation;
  invites: typeof invites;
  messages: typeof messages;
  push: typeof push;
  pushActions: typeof pushActions;
  seed: typeof seed;
  settings: typeof settings;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("../betterAuth/_generated/component.js").ComponentApi<"betterAuth">;
  resend: import("@convex-dev/resend/_generated/component.js").ComponentApi<"resend">;
};
