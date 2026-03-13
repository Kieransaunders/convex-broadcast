/**
 * Seed script: creates the demo user via Better Auth, then seeds sample data.
 *
 * Usage: npx tsx scripts/seed-demo-user.ts
 */

const SITE_URL = "https://handsome-schnauzer-41.eu-west-1.convex.site";
const DEMO = {
  name: "Demo Admin",
  email: "demo@orgcomms.test",
  password: "demopass123!",
};

async function main() {
  console.log("1. Creating demo user via Better Auth...");

  // Better Auth expects the body wrapped with specific fields
  const signUpRes = await fetch(`${SITE_URL}/api/auth/sign-up/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: DEMO.name,
      email: DEMO.email,
      password: DEMO.password,
    }),
  });

  console.log(`   Sign-up response: ${signUpRes.status}`);
  const text = await signUpRes.text();
  if (text) {
    try {
      console.log(`   Body: ${JSON.stringify(JSON.parse(text), null, 2)}`);
    } catch {
      console.log(`   Body: ${text}`);
    }
  }

  if (!signUpRes.ok) {
    // Try sign-in in case user already exists
    console.log("\n   Trying sign-in (user may already exist)...");
    const signInRes = await fetch(`${SITE_URL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: DEMO.email,
        password: DEMO.password,
      }),
    });
    console.log(`   Sign-in response: ${signInRes.status}`);
    const signInText = await signInRes.text();
    if (signInText) console.log(`   Body: ${signInText}`);
  }

  // Wait a moment for the trigger to create the user record
  console.log("\n2. Waiting 3s for user trigger to complete...");
  await new Promise((r) => setTimeout(r, 3000));

  console.log("3. Running seed mutation via Convex CLI...");
  const { execSync } = await import("child_process");
  try {
    const result = execSync('npx convex run seed:seedDemoData \'{}\'', {
      encoding: "utf-8",
      cwd: process.cwd(),
      stdio: "pipe",
    });
    console.log(`   Result: ${result}`);
  } catch (e: any) {
    console.error(`   Seed failed: ${e.stderr || e.message}`);
  }
}

main().catch(console.error);
