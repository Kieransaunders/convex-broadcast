#!/usr/bin/env tsx
/**
 * Implementation Verification Script for Org Comms PWA
 *
 * This script verifies that all components from the implementation plan
 * have been properly implemented according to specifications.
 *
 * Run with: npx tsx scripts/verify-implementation.ts
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const COLORS = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
}

// Helper functions
const fileExists = (path: string): boolean => existsSync(join(ROOT, path));
const readFile = (path: string): string => {
  try {
    return readFileSync(join(ROOT, path), "utf-8");
  } catch {
    return "";
  }
};
const log = (msg: string, color: keyof typeof COLORS = "reset") => {
  console.log(`${COLORS[color]}${msg}${COLORS.reset}`);
};

// =====================
// LAYER 1: FOUNDATION
// =====================

function testLayer1Foundation(): TestSuite {
  const tests: TestResult[] = [];

  // Task 1: Dependencies
  tests.push({
    name: "Package.json exists with required dependencies",
    passed: fileExists("package.json"),
  });

  const packageJson = JSON.parse(readFile("package.json") || "{}");
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  // better-auth is a transitive dependency via @convex-dev/better-auth
  // We check that it's available in node_modules
  tests.push({
    name: "better-auth is available (via @convex-dev/better-auth)",
    passed: fileExists("node_modules/better-auth/package.json"),
  });
  tests.push({
    name: "@convex-dev/better-auth is installed",
    passed: "@convex-dev/better-auth" in deps,
  });
  tests.push({
    name: "@convex-dev/resend is installed",
    passed: "@convex-dev/resend" in deps,
  });
  tests.push({
    name: "web-push is installed",
    passed: "web-push" in deps,
  });
  tests.push({
    name: "lucide-react is installed",
    passed: "lucide-react" in deps,
  });
  tests.push({
    name: "tailwindcss v4 is installed",
    passed:
      deps["tailwindcss"]?.startsWith("4.") ||
      deps["tailwindcss"]?.includes("4."),
  });

  // Task 2: Schema
  tests.push({
    name: "convex/schema.ts exists",
    passed: fileExists("convex/schema.ts"),
  });

  const schema = readFile("convex/schema.ts");
  const requiredTables = [
    "users",
    "groups",
    "groupMemberships",
    "events",
    "messages",
    "messageTargets",
    "deliveries",
    "invites",
    "impersonationLogs",
    "pushSubscriptions",
  ];

  for (const table of requiredTables) {
    tests.push({
      name: `Schema has ${table} table`,
      passed: schema.includes(`${table}:`) || schema.includes(`${table} =`),
    });
  }

  // Task 3: Better Auth Setup
  tests.push({
    name: "convex/convex.config.ts exists",
    passed: fileExists("convex/convex.config.ts"),
  });
  tests.push({
    name: "convex/betterAuth/convex.config.ts exists",
    passed: fileExists("convex/betterAuth/convex.config.ts"),
  });
  tests.push({
    name: "convex/auth.config.ts exists",
    passed: fileExists("convex/auth.config.ts"),
  });
  tests.push({
    name: "convex/auth.ts exists",
    passed: fileExists("convex/auth.ts"),
  });
  tests.push({
    name: "convex/http.ts exists",
    passed: fileExists("convex/http.ts"),
  });
  tests.push({
    name: "src/lib/auth-client.tsx exists",
    passed: fileExists("src/lib/auth-client.tsx"),
  });
  tests.push({
    name: "src/lib/auth-server.ts exists",
    passed: fileExists("src/lib/auth-server.ts"),
  });
  tests.push({
    name: "src/routes/api/auth/$.ts exists",
    passed: fileExists("src/routes/api/auth/$.ts"),
  });

  const authTs = readFile("convex/auth.ts");
  tests.push({
    name: "auth.ts has getUser helper",
    passed: authTs.includes("export const getUser"),
  });
  tests.push({
    name: "auth.ts has getAdminUser helper",
    passed: authTs.includes("export const getAdminUser"),
  });
  tests.push({
    name: "auth.ts has getSuperAdminUser helper",
    passed: authTs.includes("export const getSuperAdminUser"),
  });
  tests.push({
    name: "auth.ts has user creation trigger",
    passed: authTs.includes("onCreate"),
  });

  // Task 4: Resend
  tests.push({
    name: "convex/email.ts exists",
    passed: fileExists("convex/email.ts"),
  });
  tests.push({
    name: "convex/crons.ts exists",
    passed: fileExists("convex/crons.ts"),
  });

  // Task 5: Design System
  tests.push({
    name: "src/styles/app.css exists",
    passed: fileExists("src/styles/app.css"),
  });

  const appCss = readFile("src/styles/app.css");
  tests.push({
    name: "app.css imports Plus Jakarta Sans",
    passed: appCss.includes("Plus Jakarta Sans"),
  });
  tests.push({
    name: "app.css defines primary color (#6366F1)",
    passed: appCss.includes("#6366F1"),
  });
  tests.push({
    name: "app.css defines CTA color (#10B981)",
    passed: appCss.includes("#10B981"),
  });
  tests.push({
    name: "app.css defines background color (#F5F3FF)",
    passed: appCss.includes("#F5F3FF"),
  });

  return { name: "Layer 1: Foundation", tests };
}

// =====================
// LAYER 2: CRUD FUNCTIONS
// =====================

function testLayer2Crud(): TestSuite {
  const tests: TestResult[] = [];

  // Task 6: User management
  tests.push({
    name: "convex/users.ts exists",
    passed: fileExists("convex/users.ts"),
  });

  const usersTs = readFile("convex/users.ts");
  tests.push({
    name: "users.ts exports 'list' query",
    passed: usersTs.includes("export const list"),
  });
  tests.push({
    name: "users.ts exports 'getById' query",
    passed: usersTs.includes("export const getById"),
  });
  tests.push({
    name: "users.ts exports 'updateRole' mutation",
    passed: usersTs.includes("export const updateRole"),
  });
  tests.push({
    name: "users.ts exports 'updateStatus' mutation",
    passed: usersTs.includes("export const updateStatus"),
  });

  // Task 7: Groups
  tests.push({
    name: "convex/groups.ts exists",
    passed: fileExists("convex/groups.ts"),
  });

  const groupsTs = readFile("convex/groups.ts");
  tests.push({
    name: "groups.ts exports 'list' query",
    passed: groupsTs.includes("export const list"),
  });
  tests.push({
    name: "groups.ts exports 'create' mutation",
    passed: groupsTs.includes("export const create"),
  });
  tests.push({
    name: "groups.ts exports 'getMembers' query",
    passed: groupsTs.includes("export const getMembers"),
  });
  tests.push({
    name: "groups.ts exports 'addMember' mutation",
    passed: groupsTs.includes("export const addMember"),
  });
  tests.push({
    name: "groups.ts exports 'removeMember' mutation",
    passed: groupsTs.includes("export const removeMember"),
  });

  // Task 8: Events
  tests.push({
    name: "convex/events.ts exists",
    passed: fileExists("convex/events.ts"),
  });

  const eventsTs = readFile("convex/events.ts");
  tests.push({
    name: "events.ts exports 'list' query",
    passed: eventsTs.includes("export const list"),
  });
  tests.push({
    name: "events.ts exports 'create' mutation",
    passed: eventsTs.includes("export const create"),
  });
  tests.push({
    name: "events.ts exports 'update' mutation",
    passed: eventsTs.includes("export const update"),
  });

  // Task 9: Invites
  tests.push({
    name: "convex/invites.ts exists",
    passed: fileExists("convex/invites.ts"),
  });

  const invitesTs = readFile("convex/invites.ts");
  tests.push({
    name: "invites.ts exports 'list' query",
    passed: invitesTs.includes("export const list"),
  });
  tests.push({
    name: "invites.ts exports 'create' mutation",
    passed: invitesTs.includes("export const create"),
  });
  tests.push({
    name: "invites.ts exports 'revoke' mutation",
    passed: invitesTs.includes("export const revoke"),
  });
  tests.push({
    name: "invites.ts sends email via Resend",
    passed: invitesTs.includes("resend.sendEmail"),
  });

  return { name: "Layer 2: CRUD Functions", tests };
}

// =====================
// LAYER 3: MESSAGING
// =====================

function testLayer3Messaging(): TestSuite {
  const tests: TestResult[] = [];

  // Task 10: Messages
  tests.push({
    name: "convex/messages.ts exists",
    passed: fileExists("convex/messages.ts"),
  });

  const messagesTs = readFile("convex/messages.ts");
  tests.push({
    name: "messages.ts exports 'list' query",
    passed: messagesTs.includes("export const list"),
  });
  tests.push({
    name: "messages.ts exports 'getById' query",
    passed: messagesTs.includes("export const getById"),
  });
  tests.push({
    name: "messages.ts exports 'create' mutation",
    passed: messagesTs.includes("export const create"),
  });
  tests.push({
    name: "messages.ts exports 'update' mutation",
    passed: messagesTs.includes("export const update"),
  });
  tests.push({
    name: "messages.ts exports 'sendNow' mutation",
    passed: messagesTs.includes("export const sendNow"),
  });
  tests.push({
    name: "messages.ts exports 'schedule' mutation",
    passed: messagesTs.includes("export const schedule"),
  });
  tests.push({
    name: "messages.ts exports 'cancelScheduled' mutation",
    passed: messagesTs.includes("export const cancelScheduled"),
  });
  tests.push({
    name: "messages.ts exports 'executeSend' internal mutation",
    passed: messagesTs.includes("export const executeSend"),
  });
  tests.push({
    name: "messages.ts exports 'resolveAudience' internal mutation",
    passed: messagesTs.includes("export const resolveAudience"),
  });
  tests.push({
    name: "messages.ts exports 'feed' query for members",
    passed: messagesTs.includes("export const feed"),
  });
  tests.push({
    name: "messages.ts exports 'markRead' mutation",
    passed: messagesTs.includes("export const markRead"),
  });
  tests.push({
    name: "messages.ts exports 'getDeliveryStats' query",
    passed: messagesTs.includes("export const getDeliveryStats"),
  });

  // Task 11: Push notifications
  tests.push({
    name: "convex/push.ts exists",
    passed: fileExists("convex/push.ts"),
  });

  const pushTs = readFile("convex/push.ts");
  tests.push({
    name: "push.ts exports 'subscribe' mutation",
    passed: pushTs.includes("export const subscribe"),
  });
  tests.push({
    name: "push.ts exports 'unsubscribe' mutation",
    passed: pushTs.includes("export const unsubscribe"),
  });
  tests.push({
    name: "push.ts exports 'updatePreference' mutation",
    passed: pushTs.includes("export const updatePreference"),
  });
  tests.push({
    name: "push.ts exports 'getMySubscription' query",
    passed: pushTs.includes("export const getMySubscription"),
  });

  tests.push({
    name: "convex/pushActions.ts exists",
    passed: fileExists("convex/pushActions.ts"),
  });

  const pushActionsTs = readFile("convex/pushActions.ts");
  tests.push({
    name: "pushActions.ts has 'use node' directive",
    passed: pushActionsTs.includes('"use node"'),
  });
  tests.push({
    name: "pushActions.ts exports 'sendPushForMessage' action",
    passed: pushActionsTs.includes("export const sendPushForMessage"),
  });
  tests.push({
    name: "pushActions.ts uses web-push library",
    passed:
      pushActionsTs.includes("web-push") || pushActionsTs.includes("webpush"),
  });

  // Task 12: Impersonation
  tests.push({
    name: "convex/impersonation.ts exists",
    passed: fileExists("convex/impersonation.ts"),
  });

  const impersonationTs = readFile("convex/impersonation.ts");
  tests.push({
    name: "impersonation.ts exports 'logStart' mutation",
    passed: impersonationTs.includes("export const logStart"),
  });
  tests.push({
    name: "impersonation.ts exports 'logEnd' mutation",
    passed: impersonationTs.includes("export const logEnd"),
  });
  tests.push({
    name: "impersonation.ts exports 'list' query",
    passed: impersonationTs.includes("export const list"),
  });

  return { name: "Layer 3: Messaging & Scheduling", tests };
}

// =====================
// LAYER 4-6: UI & PWA
// =====================

function testLayer4to6UIandPWA(): TestSuite {
  const tests: TestResult[] = [];

  // Task 13-15: UI Components and Routes
  const requiredComponents = [
    "button",
    "card",
    "input",
    "label",
    "textarea",
    "select",
    "badge",
    "dialog",
    "table",
    "tabs",
    "sidebar",
    "separator",
    "avatar",
    "dropdown-menu",
    "skeleton",
  ];

  for (const component of requiredComponents) {
    tests.push({
      name: `UI component ${component} exists`,
      passed: fileExists(`src/components/ui/${component}.tsx`),
    });
  }

  // Auth routes
  tests.push({
    name: "src/routes/_authed.tsx exists (auth guard)",
    passed: fileExists("src/routes/_authed.tsx"),
  });
  tests.push({
    name: "src/routes/_authed/_admin.tsx exists (admin guard)",
    passed: fileExists("src/routes/_authed/_admin.tsx"),
  });
  tests.push({
    name: "src/routes/index.tsx exists (landing page)",
    passed: fileExists("src/routes/index.tsx"),
  });
  tests.push({
    name: "src/routes/sign-in.tsx exists",
    passed: fileExists("src/routes/sign-in.tsx"),
  });
  tests.push({
    name: "src/routes/sign-up.tsx exists",
    passed: fileExists("src/routes/sign-up.tsx"),
  });
  tests.push({
    name: "src/routes/_authed/feed.tsx exists (member feed)",
    passed: fileExists("src/routes/_authed/feed.tsx"),
  });
  tests.push({
    name: "src/routes/_authed/settings.tsx exists",
    passed: fileExists("src/routes/_authed/settings.tsx"),
  });

  // Admin routes
  tests.push({
    name: "src/routes/_authed/_admin/dashboard.tsx exists",
    passed: fileExists("src/routes/_authed/_admin/dashboard.tsx"),
  });
  tests.push({
    name: "src/routes/_authed/_admin/users/index.tsx exists",
    passed: fileExists("src/routes/_authed/_admin/users/index.tsx"),
  });
  tests.push({
    name: "src/routes/_authed/_admin/groups/index.tsx exists",
    passed: fileExists("src/routes/_authed/_admin/groups/index.tsx"),
  });
  tests.push({
    name: "src/routes/_authed/_admin/events/index.tsx exists",
    passed: fileExists("src/routes/_authed/_admin/events/index.tsx"),
  });
  tests.push({
    name: "src/routes/_authed/_admin/messages/index.tsx exists",
    passed: fileExists("src/routes/_authed/_admin/messages/index.tsx"),
  });
  tests.push({
    name: "src/routes/_authed/_admin/messages/new.tsx exists",
    passed: fileExists("src/routes/_authed/_admin/messages/new.tsx"),
  });

  // Task 18: PWA
  tests.push({
    name: "public/manifest.json exists",
    passed: fileExists("public/manifest.json"),
  });

  const manifest = JSON.parse(readFile("public/manifest.json") || "{}");
  tests.push({
    name: "manifest.json has correct name",
    passed: manifest.name === "Org Comms",
  });
  tests.push({
    name: "manifest.json has correct start_url",
    passed: manifest.start_url === "/feed",
  });
  tests.push({
    name: "manifest.json has correct theme_color",
    passed: manifest.theme_color === "#6366F1",
  });

  tests.push({
    name: "public/sw.js exists (service worker)",
    passed: fileExists("public/sw.js"),
  });

  const swJs = readFile("public/sw.js");
  tests.push({
    name: "Service worker has push event listener",
    passed: swJs.includes('addEventListener("push"'),
  });
  tests.push({
    name: "Service worker has notificationclick listener",
    passed: swJs.includes('addEventListener("notificationclick"'),
  });

  // Check root component for SW registration
  const rootTsx = readFile("src/routes/__root.tsx");
  tests.push({
    name: "__root.tsx registers service worker",
    passed: rootTsx.includes("navigator.serviceWorker.register"),
  });
  tests.push({
    name: "__root.tsx links to manifest.json",
    passed: rootTsx.includes("/manifest.json"),
  });

  return { name: "Layer 4-6: UI, Routes & PWA", tests };
}

// =====================
// MAIN EXECUTION
// =====================

function printResults(suites: TestSuite[]) {
  console.log("\n" + "=".repeat(60));
  log("ORG COMMS PWA - IMPLEMENTATION VERIFICATION", "blue");
  console.log("=".repeat(60) + "\n");

  let totalTests = 0;
  let totalPassed = 0;

  for (const suite of suites) {
    log(`📦 ${suite.name}`, "blue");
    console.log("-".repeat(50));

    for (const test of suite.tests) {
      const icon = test.passed ? "✅" : "❌";
      const color = test.passed ? "green" : "red";
      log(`  ${icon} ${test.name}`, color);
    }

    const passed = suite.tests.filter((t) => t.passed).length;
    const total = suite.tests.length;
    totalTests += total;
    totalPassed += passed;

    console.log("");
  }

  console.log("=".repeat(60));
  const overallColor =
    totalPassed === totalTests
      ? "green"
      : totalPassed > totalTests / 2
        ? "yellow"
        : "red";
  log(`📊 RESULTS: ${totalPassed}/${totalTests} tests passed`, overallColor);

  const percentage = Math.round((totalPassed / totalTests) * 100);
  log(`📈 Completion: ${percentage}%`, overallColor);

  if (totalPassed === totalTests) {
    log("\n🎉 All implementation requirements verified!", "green");
  } else {
    log(`\n⚠️  ${totalTests - totalPassed} items need attention`, "yellow");
  }

  console.log("=".repeat(60) + "\n");

  return totalPassed === totalTests;
}

// Run all tests
const suites = [
  testLayer1Foundation(),
  testLayer2Crud(),
  testLayer3Messaging(),
  testLayer4to6UIandPWA(),
];

const allPassed = printResults(suites);
process.exit(allPassed ? 0 : 1);
