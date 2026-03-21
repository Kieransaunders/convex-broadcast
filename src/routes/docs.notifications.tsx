import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  CheckCircle,
  Code,
  Shield,
  Smartphone,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DocsPageShell, FaqSection } from "~/components/docs-nav";

export const Route = createFileRoute("/docs/notifications")({
  component: NotificationsDocsPage,
  head: () => ({
    meta: [
      {
        title:
          "Web Push Notifications — Desktop & Mobile Alerts via PWA | Org Comms",
      },
      {
        name: "description",
        content:
          "Learn how Org Comms implements Web Push notifications using Service Workers, VAPID keys, and Convex. Reach your members on any device even when the app is closed.",
      },
    ],
  }),
});

function PushFlowMockup() {
  const steps = [
    { label: "Admin sends message", icon: "✉️" },
    { label: "Convex triggers push", icon: "⚡" },
    { label: "Push service delivers", icon: "🌐" },
    { label: "Service Worker shows alert", icon: "🔔" },
  ];
  return (
    <div className="rounded-xl overflow-hidden border border-[#6366F1]/15 shadow-lg bg-[#1E1B4B]">
      <div className="px-4 py-2.5 flex items-center gap-2 border-b border-white/10">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400/80" />
          <div className="h-3 w-3 rounded-full bg-amber-400/80" />
          <div className="h-3 w-3 rounded-full bg-green-400/80" />
        </div>
        <div className="flex-1 flex justify-center">
          <span className="text-white/40 text-xs font-mono">Push Notification Flow</span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex flex-col gap-3">
          {steps.map((s, i) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#6366F1] text-lg">
                {s.icon}
              </div>
              <div className="flex-1 rounded-lg bg-white/10 px-4 py-2.5">
                <span className="text-white text-sm font-medium">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="absolute left-8 translate-y-9 h-3 w-0.5 bg-[#6366F1]/40" />
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-[#818CF8] shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-white">Org Comms</div>
              <div className="text-xs text-white/60 mt-0.5">Q3 Town Hall — Save the date</div>
            </div>
            <span className="ml-auto text-[10px] text-white/30 shrink-0">now</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsDocsPage() {
  return (
    <DocsPageShell>
      {/* Hero */}
      <div className="inline-flex items-center gap-2 rounded-full bg-[#6366F1]/10 px-4 py-1.5 text-sm font-medium text-[#6366F1] mb-6">
        <Bell className="h-4 w-4" />
        Feature Guide
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-[#1E1B4B] sm:text-5xl mb-4">
        Push Notifications
      </h1>
      <p className="text-xl text-[#1E1B4B]/70 leading-relaxed mb-10 max-w-3xl">
        Web Push notifications allow Org Comms to re-engage members even when
        the application isn't open. Using Service Workers and VAPID keys, you
        can deliver real-time alerts to desktop and mobile devices.
      </p>

      {/* How it works cards */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-[#1E1B4B] mb-6">How it works</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Card className="border-[#6366F1]/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-5 w-5 text-[#6366F1]" />
                VAPID Security
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[#1E1B4B]/70 text-sm">
              VAPID (Voluntary Application Server Identification) keys
              authenticate your server with the push delivery service,
              preventing unauthorized notifications. Generate them once with{" "}
              <code className="bg-[#F5F3FF] px-1 rounded text-xs">
                npx web-push generate-vapid-keys
              </code>{" "}
              and add them to your Convex environment.
            </CardContent>
          </Card>
          <Card className="border-[#6366F1]/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Code className="h-5 w-5 text-[#6366F1]" />
                Service Workers
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[#1E1B4B]/70 text-sm">
              The Service Worker at <code className="bg-[#F5F3FF] px-1 rounded text-xs">public/sw.js</code>{" "}
              runs in the background, listens for push events, and displays the
              notification — even when the main browser tab is closed.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Flow diagram */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-[#1E1B4B] mb-2">The delivery flow</h2>
        <p className="text-[#1E1B4B]/60 text-sm mb-6">
          From admin action to device notification — four steps handled entirely by Org Comms and Convex.
        </p>
        <div className="grid gap-6 lg:grid-cols-2">
          <PushFlowMockup />
          <div className="bg-white rounded-xl border border-[#6366F1]/10 p-6 shadow-sm">
            <h3 className="font-bold text-[#1E1B4B] mb-4">The Implementation Chain</h3>
            <div className="space-y-5">
              {[
                {
                  title: "User Permission",
                  desc: "Modern browsers require a manual user gesture to request notification permissions. This is why Org Comms includes an 'Enable Alerts' button.",
                  icon: "👆",
                },
                {
                  title: "Subscription Creation",
                  desc: "Once permitted, the browser generates a unique endpoint and cryptographic keys for that specific browser instance.",
                  icon: "🌐",
                },
                {
                  title: "Secure Storage",
                  desc: "Subscriptions are stored in Convex linked to the user account, enabling targeted broadcasts without managing complex infrastructure.",
                  icon: "🔒",
                },
                {
                  title: "Broadcast Delivery",
                  desc: "When an admin sends a message, an internal Node.js action in Convex triggers the web-push protocol to reach the user.",
                  icon: "📤",
                },
              ].map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6366F1] text-white text-xs font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1E1B4B] text-sm">{step.title}</h4>
                    <p className="text-xs text-[#1E1B4B]/60 leading-relaxed mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PWA mobile section */}
      <section className="mb-10 rounded-xl bg-[#1E1B4B] p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-2">Optimising for Mobile (PWA)</h2>
          <p className="text-white/70 text-sm mb-6 leading-relaxed">
            For a native-like notification experience on iOS and Android, it is
            highly recommended to install the application as a PWA from the
            browser's "Add to Home Screen" option.
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-[#10B981] shrink-0 mt-0.5" />
              <span className="text-sm">
                <strong>Persistence:</strong> PWA apps maintain background sync
                more reliably than browser tabs.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-[#10B981] shrink-0 mt-0.5" />
              <span className="text-sm">
                <strong>Badging:</strong> App icon badges can reflect the number
                of unread messages.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-[#10B981] shrink-0 mt-0.5" />
              <span className="text-sm">
                <strong>Trust:</strong> Home screen apps usually have higher
                notification permission retention rates.
              </span>
            </li>
          </ul>
        </div>
        <Smartphone className="absolute -bottom-10 -right-10 h-64 w-64 text-white/5 rotate-12" />
      </section>

      {/* Setup */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-[#1E1B4B] mb-6">Setting up push notifications</h2>
        <div className="space-y-4">
          {[
            {
              step: 1,
              title: "Generate VAPID keys",
              detail: (
                <>
                  Run{" "}
                  <code className="bg-[#F5F3FF] px-1 rounded text-xs">
                    npx web-push generate-vapid-keys
                  </code>{" "}
                  to generate your public/private VAPID key pair.
                </>
              ),
            },
            {
              step: 2,
              title: "Add keys to environment",
              detail: (
                <>
                  Set <code className="bg-[#F5F3FF] px-1 rounded text-xs">VITE_VAPID_PUBLIC_KEY</code>{" "}
                  in <code className="bg-[#F5F3FF] px-1 rounded text-xs">.env.local</code> and{" "}
                  <code className="bg-[#F5F3FF] px-1 rounded text-xs">VAPID_PUBLIC_KEY</code> +{" "}
                  <code className="bg-[#F5F3FF] px-1 rounded text-xs">VAPID_PRIVATE_KEY</code>{" "}
                  in the Convex dashboard using{" "}
                  <code className="bg-[#F5F3FF] px-1 rounded text-xs">npx convex env set</code>.
                </>
              ),
            },
            {
              step: 3,
              title: "Enable alerts in the app",
              detail:
                "After signing in, navigate to the Messages page and click 'Enable Alerts'. Grant notification permission in the browser prompt.",
            },
            {
              step: 4,
              title: "Send a test message",
              detail:
                "As an admin, send a broadcast message. The recipient should receive a browser/device notification within seconds.",
            },
          ].map(({ step, title, detail }) => (
            <div key={step} className="flex gap-4 bg-white rounded-xl border border-[#6366F1]/10 p-5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6366F1] text-white text-xs font-bold">
                {step}
              </div>
              <div>
                <h3 className="font-semibold text-[#1E1B4B] mb-1">{title}</h3>
                <p className="text-sm text-[#1E1B4B]/60 leading-relaxed">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <FaqSection
        items={[
          {
            q: "Why do users need to click 'Enable Alerts' before receiving push notifications?",
            a: "Modern browsers require an explicit user gesture to request notification permissions. This is a browser security requirement, not an Org Comms limitation. Automatically requesting permission on page load is blocked by browsers and would likely be denied by users.",
          },
          {
            q: "Do push notifications work when the browser is completely closed?",
            a: "On desktop browsers, the browser process typically needs to be running (even in the background) for push notifications to arrive. On mobile, installing the app as a PWA gives you the most reliable background notification delivery.",
          },
          {
            q: "Does Org Comms support push notifications on iOS?",
            a: "Yes, via the PWA. iOS 16.4+ supports Web Push for installed PWAs. Users must add the app to their Home Screen via Safari's 'Add to Home Screen' option to receive push notifications.",
          },
          {
            q: "What happens if a push notification fails to deliver?",
            a: "If the push service returns an error (e.g. the subscription has expired), the delivery record is still created for the inbox message. The push failure is logged but does not prevent the message from appearing in the member's inbox.",
          },
          {
            q: "Can members control which types of notifications they receive?",
            a: "Yes. Members can set their push preference to 'all' (receive all messages), 'urgent' (only high-priority messages), or 'none' (disable push). This preference is stored in the pushSubscriptions table.",
          },
          {
            q: "Do I need a separate paid notification service?",
            a: "No. Org Comms uses the Web Push protocol directly via the open-source web-push npm package. There is no third-party notification service required — notifications are delivered through the browser's native push infrastructure (operated by browser vendors).",
          },
        ]}
      />

      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <Button className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white">
          <Link to="/sign-in" search={{ demo: true } as any} className="flex items-center gap-2">
            Try it in the Demo <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" className="border-[#6366F1]/20 text-[#6366F1] hover:bg-[#6366F1]/10">
          <Link to="/docs/group-management">Next: Group Management →</Link>
        </Button>
      </div>
    </DocsPageShell>
  );
}
