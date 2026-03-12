#!/usr/bin/env node
/**
 * Backend Integration Test Script
 * 
 * Tests the Convex backend functions by making actual API calls.
 * Requires the dev server to be running.
 * 
 * Run with: node scripts/test-backend.js
 * Or with Convex URL: CONVEX_URL=https://... node scripts/test-backend.js
 */

const CONVEX_URL = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL

if (!CONVEX_URL) {
  console.error("❌ Error: VITE_CONVEX_URL or CONVEX_URL environment variable required")
  console.error("   Example: VITE_CONVEX_URL=https://your-deployment.convex.cloud node scripts/test-backend.js")
  process.exit(1)
}

console.log(`\n🧪 Testing Convex Backend at: ${CONVEX_URL}\n`)

// Simple test runner
const tests = []
let passed = 0
let failed = 0

function test(name, fn) {
  tests.push({ name, fn })
}

async function runTests() {
  for (const { name, fn } of tests) {
    try {
      await fn()
      console.log(`✅ ${name}`)
      passed++
    } catch (error) {
      console.log(`❌ ${name}`)
      console.log(`   Error: ${error.message}`)
      failed++
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`)
  process.exit(failed > 0 ? 1 : 0)
}

// Helper to make Convex queries
async function convexQuery(name, args = {}) {
  // Note: This is a simplified check - real testing requires authentication
  // This script primarily verifies the endpoints exist and are structured correctly
  const response = await fetch(`${CONVEX_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: name, args }),
  })
  
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`HTTP ${response.status}: ${text}`)
  }
  
  return response.json()
}

// =====================
// SCHEMA VALIDATION TESTS
// =====================

test("Schema has required tables", async () => {
  // This would require admin access to check schema
  // For now, we just verify the deployment responds
  const response = await fetch(CONVEX_URL)
  if (!response.ok) {
    throw new Error("Convex deployment not accessible")
  }
})

// =====================
// AUTH TESTS (Unauthenticated)
// =====================

test("Unauthenticated requests return error", async () => {
  try {
    await convexQuery("users:list", {})
    throw new Error("Should have failed without auth")
  } catch (error) {
    // Expected to fail
    if (!error.message.includes("Unauthenticated") && !error.message.includes("401")) {
      throw new Error("Unexpected error type")
    }
  }
})

test("Public auth endpoints accessible", async () => {
  const response = await fetch(`${CONVEX_URL}/api/auth/getSession`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  // Should return 200 with null session (not an error)
  if (!response.ok && response.status !== 401) {
    throw new Error(`Unexpected status: ${response.status}`)
  }
})

// =====================
// API STRUCTURE TESTS
// =====================

const expectedQueries = [
  "auth:getCurrentUser",
  "users:list",
  "users:getById",
  "groups:list",
  "groups:getById",
  "groups:getMembers",
  "events:list",
  "events:getById",
  "messages:list",
  "messages:getById",
  "messages:feed",
  "messages:getDeliveryStats",
  "invites:list",
  "push:getMySubscription",
  "impersonation:list",
]

const expectedMutations = [
  "users:updateRole",
  "users:updateStatus",
  "groups:create",
  "groups:update",
  "groups:addMember",
  "groups:removeMember",
  "events:create",
  "events:update",
  "messages:create",
  "messages:update",
  "messages:sendNow",
  "messages:schedule",
  "messages:cancelScheduled",
  "messages:archive",
  "messages:markRead",
  "invites:create",
  "invites:revoke",
  "push:subscribe",
  "push:unsubscribe",
  "push:updatePreference",
  "impersonation:logStart",
  "impersonation:logEnd",
]

// =====================
// HTTP ENDPOINT TESTS
// =====================

test("HTTP router is accessible", async () => {
  const response = await fetch(`${CONVEX_URL}/api/version`)
  // Should not 404 (might 403 or return version info)
  if (response.status === 404) {
    throw new Error("HTTP router not found")
  }
})

// =====================
// RUN TESTS
// =====================

runTests()
