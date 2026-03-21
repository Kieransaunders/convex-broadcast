import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart2,
  CheckCircle,
  Eye,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { DocsPageShell, FaqSection } from "~/components/docs-nav";

export const Route = createFileRoute("/docs/delivery-tracking")({
  component: DeliveryTrackingPage,
  head: () => ({
    meta: [
      {
        title:
          "Delivery Tracking — Real-Time Message Read Receipts & Analytics | Org Comms",
      },
      {
        name: "description",
        content:
          "Track message delivery and read receipts in real time with Org Comms. See exactly who has received and opened each broadcast, with live stats powered by Convex.",
      },
    ],
  }),
});

function DeliveryStatsMockup() {
  const stats = [
    { label: "Recipients", value: "47", sub: "total", color: "text-[#1E1B4B]" },
    { label: "Delivered", value: "47", sub: "100%", color: "text-[#10B981]" },
    { label: "Read", value: "31", sub: "66%", color: "text-[#6366F1]" },
    { label: "Push sent", value: "28", sub: "60%", color: "text-[#818CF8]" },
  ];
  return (
    <div className="rounded-xl overflow-hidden border border-[#6366F1]/15 shadow-lg bg-white">
      <div className="bg-[#1E1B4B] px-4 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400/80" />
          <div className="h-3 w-3 rounded-full bg-amber-400/80" />
          <div className="h-3 w-3 rounded-full bg-green-400/80" />
        </div>
        <div className="flex-1 flex justify-center">
          <span className="text-white/40 text-xs font-mono">Message Analytics</span>
        </div>
      </div>
      <div className="p-4">
        <div className="text-[10px] font-semibold text-[#1E1B4B]/50 uppercase tracking-wide mb-1">Q3 Town Hall — Save the date</div>
        <div className="text-[9px] text-[#1E1B4B]/30 mb-4">Sent 20 Mar 2026 at 10:05 · All Members</div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-[#F5F3FF] rounded-lg p-2.5 text-center">
              <div className={`text-lg font-bold leading-none mb-0.5 ${s.color}`}>{s.value}</div>
              <div className="text-[8px] text-[#1E1B4B]/40 font-medium">{s.label}</div>
              <div className="text-[8px] text-[#1E1B4B]/30">{s.sub}</div>
            </div>
          ))}
        </div>
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-[9px] text-[#1E1B4B]/40 mb-1">
            <span>Read rate</span>
            <span>66%</span>
          </div>
          <div className="h-2 rounded-full bg-[#6366F1]/10 overflow-hidden">
            <div className="h-full rounded-full bg-[#6366F1]" style={{ width: "66%" }} />
          </div>
        </div>
        {/* Mini list */}
        <div className="text-[9px] font-semibold text-[#1E1B4B]/40 uppercase tracking-wide mb-1.5">Recent reads</div>
        <div className="space-y-1.5">
          {[
            { name: "Alice Chen", time: "10:07" },
            { name: "Ben Owens", time: "10:12" },
            { name: "Clara Diaz", time: "10:18" },
          ].map((r) => (
            <div key={r.name} className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-[#6366F1]/20 flex items-center justify-center shrink-0">
                <span className="text-[7px] font-bold text-[#6366F1]">
                  {r.name.split(" ").map((n) => n[0]).join("")}
                </span>
              </div>
              <span className="text-[10px] text-[#1E1B4B]/60 flex-1 truncate">{r.name}</span>
              <span className="text-[9px] text-[#1E1B4B]/30">{r.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageListWithStatsMockup() {
  const messages = [
    { subject: "Q3 Town Hall — Save the date", read: 31, total: 47, pct: 66 },
    { subject: "New company policy update", read: 42, total: 42, pct: 100 },
    { subject: "Office closure — bank holiday", read: 19, total: 47, pct: 40 },
  ];
  return (
    <div className="rounded-xl overflow-hidden border border-[#6366F1]/15 shadow-lg bg-white">
      <div className="bg-[#1E1B4B] px-4 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400/80" />
          <div className="h-3 w-3 rounded-full bg-amber-400/80" />
          <div className="h-3 w-3 rounded-full bg-green-400/80" />
        </div>
        <div className="flex-1 flex justify-center">
          <span className="text-white/40 text-xs font-mono">orgcomms.app/admin/messages</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="h-4 w-4 text-[#6366F1]" />
          <span className="text-sm font-bold text-[#1E1B4B]">Sent Messages</span>
        </div>
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.subject} className="p-3 rounded-lg border border-[#6366F1]/8 bg-white">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[11px] font-semibold text-[#1E1B4B] truncate">{m.subject}</span>
                <Eye className="h-3 w-3 text-[#6366F1]/50 shrink-0 mt-0.5" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-[#6366F1]/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${m.pct === 100 ? "bg-[#10B981]" : "bg-[#6366F1]"}`}
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
                <span className="text-[9px] text-[#1E1B4B]/40 shrink-0">
                  {m.read}/{m.total} read
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DeliveryTrackingPage() {
  return (
    <DocsPageShell>
      <div className="inline-flex items-center gap-2 rounded-full bg-[#6366F1]/10 px-4 py-1.5 text-sm font-medium text-[#6366F1] mb-6">
        <BarChart2 className="h-4 w-4" />
        Feature Guide
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-[#1E1B4B] sm:text-5xl mb-4">
        Delivery Tracking
      </h1>
      <p className="text-xl text-[#1E1B4B]/70 leading-relaxed mb-10 max-w-3xl">
        Know exactly who has received and read each of your broadcasts with
        real-time delivery statistics and individual read receipts — all updated
        live as members open their messages.
      </p>

      <section className="bg-white rounded-2xl border border-[#6366F1]/10 p-8 mb-10 shadow-sm">
        <h2 className="text-2xl font-bold text-[#1E1B4B] mb-6">
          What Delivery Tracking shows you
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            {
              icon: CheckCircle,
              title: "Delivery confirmation",
              desc: "Every message creates a delivery record for each recipient. Admins can see exactly how many members have been reached.",
            },
            {
              icon: Eye,
              title: "Read receipts",
              desc: "When a member opens a message in their inbox, a read timestamp is recorded. Admins see the live read count and percentage.",
            },
            {
              icon: TrendingUp,
              title: "Live statistics",
              desc: "Powered by Convex's real-time subscriptions, the stats update automatically as members read — no manual refresh needed.",
            },
            {
              icon: Users,
              title: "Per-recipient detail",
              desc: "Drill into any message to see which specific members have read it and at what time, allowing targeted follow-up.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#6366F1]/10">
                <Icon className="h-4 w-4 text-[#6366F1]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1E1B4B] text-sm mb-1">{title}</h3>
                <p className="text-sm text-[#1E1B4B]/60 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mockups */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-[#1E1B4B] mb-2">
          Message Analytics &amp; Read Receipts
        </h2>
        <p className="text-[#1E1B4B]/60 text-sm mb-6">
          The messages list shows read-rate bars at a glance. Click any message for full per-recipient analytics.
        </p>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider mb-2">
              Admin — Message List with Stats
            </p>
            <MessageListWithStatsMockup />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider mb-2">
              Admin — Message Detail Analytics
            </p>
            <DeliveryStatsMockup />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mb-10 rounded-xl bg-[#1E1B4B] p-8 text-white">
        <div className="flex items-start gap-4">
          <Zap className="h-8 w-8 text-[#818CF8] shrink-0 mt-0.5" />
          <div>
            <h2 className="text-xl font-bold mb-2">How delivery tracking works under the hood</h2>
            <p className="text-white/70 text-sm leading-relaxed mb-4">
              When a message is sent, Org Comms creates a{" "}
              <code className="bg-white/10 px-1 rounded text-xs">delivery</code>{" "}
              record for each targeted recipient. When the member opens the message
              in their inbox, a{" "}
              <code className="bg-white/10 px-1 rounded text-xs">readAt</code>{" "}
              timestamp is written to their delivery record. The admin view uses
              a Convex live query that subscribes to all deliveries for a message,
              so the counts update in real time without any polling.
            </p>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                Delivery records are created atomically with the message send.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                Read timestamps are set once; subsequent views do not overwrite them.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                Push notification delivery is tracked separately from inbox read.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How to view */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-[#1E1B4B] mb-6">
          How to view delivery statistics
        </h2>
        <div className="space-y-4">
          {[
            {
              step: 1,
              title: "Sign in as Admin",
              detail: "Delivery analytics are available to admin and super_admin users.",
            },
            {
              step: 2,
              title: "Open Admin → Messages",
              detail: "The messages list shows a read-rate progress bar for each sent message at a glance.",
            },
            {
              step: 3,
              title: "Click a message",
              detail: "Open any sent message to see full analytics: total recipients, delivery count, read count, push notification count, and a timestamped list of individual reads.",
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
            q: "Does Org Comms track whether a push notification was seen, not just delivered?",
            a: "Org Comms records whether a push notification was successfully sent to the push service (delivery). Whether the user actually saw the notification on their device is outside the scope of the Web Push protocol and is not tracked.",
          },
          {
            q: "Are read receipts opt-in for members?",
            a: "Read receipts are recorded automatically when a member opens a message in their inbox. There is no opt-out in the current boilerplate; read tracking is a core platform feature.",
          },
          {
            q: "How long are delivery records retained?",
            a: "Delivery records are stored in the Convex database with no automatic expiry. They persist as long as the message itself exists.",
          },
          {
            q: "Can I see delivery stats for scheduled messages before they are sent?",
            a: "No. Delivery records are created at send time. Before a scheduled message fires, there are no delivery stats to view.",
          },
          {
            q: "Do delivery stats update in real time or do I need to refresh?",
            a: "Stats update live. The admin message detail view uses a Convex reactive query that pushes updates to the browser as members read their messages, so the read count climbs in real time without refreshing.",
          },
          {
            q: "What is the difference between 'delivered' and 'read'?",
            a: "'Delivered' means a delivery record was successfully created for the recipient when the message was sent. 'Read' means the recipient opened the message in their inbox and a readAt timestamp was recorded.",
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
          <Link to="/docs">← Back to Docs Overview</Link>
        </Button>
      </div>
    </DocsPageShell>
  );
}
