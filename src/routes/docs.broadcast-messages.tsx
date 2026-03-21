import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  Mail,
  Send,
  Target,
  Zap,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { DocsPageShell, FaqSection } from "~/components/docs-nav";

export const Route = createFileRoute("/docs/broadcast-messages")({
  component: BroadcastMessagesPage,
  head: () => ({
    meta: [
      {
        title:
          "Broadcast Messages — Send Targeted Org-Wide Communications | Org Comms",
      },
      {
        name: "description",
        content:
          "Learn how to send broadcast messages in Org Comms. Target specific groups or all members, schedule messages in advance, and track delivery in real time.",
      },
    ],
  }),
});

/** SVG mockup: admin message composer */
function MessageComposerMockup() {
  return (
    <div className="rounded-xl overflow-hidden border border-[#6366F1]/15 shadow-lg bg-white">
      {/* Window chrome */}
      <div className="bg-[#1E1B4B] px-4 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400/80" />
          <div className="h-3 w-3 rounded-full bg-amber-400/80" />
          <div className="h-3 w-3 rounded-full bg-green-400/80" />
        </div>
        <div className="flex-1 flex justify-center">
          <span className="text-white/40 text-xs font-mono">orgcomms.app/admin/messages/new</span>
        </div>
      </div>
      {/* App shell */}
      <div className="flex" style={{ height: 340 }}>
        {/* Sidebar */}
        <div className="w-44 bg-[#F5F3FF] border-r border-[#6366F1]/10 p-3 space-y-1 shrink-0">
          <div className="text-[8px] font-bold uppercase tracking-wider text-[#6366F1]/40 px-2 mb-2">Admin</div>
          {["Dashboard", "Messages", "Groups", "Events", "Users"].map((item, i) => (
            <div
              key={item}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[10px] font-medium ${
                i === 1
                  ? "bg-[#6366F1] text-white"
                  : "text-[#1E1B4B]/50 hover:bg-[#6366F1]/10"
              }`}
            >
              <div className={`h-1.5 w-1.5 rounded-full ${i === 1 ? "bg-white" : "bg-[#6366F1]/30"}`} />
              {item}
            </div>
          ))}
        </div>

        {/* Composer */}
        <div className="flex-1 p-5 overflow-hidden">
          <div className="text-sm font-bold text-[#1E1B4B] mb-4">New Message</div>
          {/* Audience selector */}
          <div className="mb-3">
            <div className="text-[10px] font-semibold text-[#1E1B4B]/50 uppercase tracking-wide mb-1">Audience</div>
            <div className="flex gap-1.5 flex-wrap">
              {["All Members", "Engineering", "Marketing", "Events"].map((g, i) => (
                <div
                  key={g}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                    i === 0
                      ? "bg-[#6366F1] text-white border-[#6366F1]"
                      : "border-[#6366F1]/20 text-[#1E1B4B]/50"
                  }`}
                >
                  {g}
                </div>
              ))}
            </div>
          </div>
          {/* Subject */}
          <div className="mb-3">
            <div className="text-[10px] font-semibold text-[#1E1B4B]/50 uppercase tracking-wide mb-1">Subject</div>
            <div className="border border-[#6366F1]/20 rounded-lg px-3 py-2 text-[11px] text-[#1E1B4B] bg-white">
              Q3 Town Hall — Save the date
            </div>
          </div>
          {/* Body */}
          <div className="mb-3">
            <div className="text-[10px] font-semibold text-[#1E1B4B]/50 uppercase tracking-wide mb-1">Message</div>
            <div className="border border-[#6366F1]/20 rounded-lg px-3 py-2 text-[11px] text-[#1E1B4B]/70 bg-white h-16 leading-relaxed">
              Hi everyone, please mark your calendars for our upcoming Q3 Town Hall on the 28th…
            </div>
          </div>
          {/* Send controls */}
          <div className="flex gap-2 mt-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6366F1] rounded-lg">
              <Send className="h-3 w-3 text-white" />
              <span className="text-white text-[10px] font-semibold">Send Now</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 border border-[#6366F1]/20 rounded-lg">
              <Clock className="h-3 w-3 text-[#6366F1]" />
              <span className="text-[#1E1B4B]/60 text-[10px] font-medium">Schedule</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** SVG mockup: member inbox */
function InboxMockup() {
  const msgs = [
    { subject: "Q3 Town Hall — Save the date", from: "Admin", time: "2m ago", unread: true },
    { subject: "New company policy update", from: "HR Team", time: "1h ago", unread: false },
    { subject: "Office closure — bank holiday", from: "Admin", time: "Yesterday", unread: false },
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
          <span className="text-white/40 text-xs font-mono">orgcomms.app/inbox</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-[#1E1B4B]">Inbox</span>
          <span className="text-[10px] bg-[#6366F1] text-white rounded-full px-2 py-0.5 font-bold">1 new</span>
        </div>
        <div className="space-y-2">
          {msgs.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                msg.unread
                  ? "border-[#6366F1]/20 bg-[#6366F1]/5"
                  : "border-[#1E1B4B]/8 bg-white"
              }`}
            >
              <div
                className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                  msg.unread ? "bg-[#6366F1]" : "bg-transparent"
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-semibold truncate ${
                      msg.unread ? "text-[#1E1B4B]" : "text-[#1E1B4B]/60"
                    }`}
                  >
                    {msg.subject}
                  </span>
                  <span className="text-[9px] text-[#1E1B4B]/40 shrink-0">{msg.time}</span>
                </div>
                <span className="text-[9px] text-[#1E1B4B]/40">{msg.from}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BroadcastMessagesPage() {
  return (
    <DocsPageShell>
      {/* Hero */}
      <div className="inline-flex items-center gap-2 rounded-full bg-[#6366F1]/10 px-4 py-1.5 text-sm font-medium text-[#6366F1] mb-6">
        <Mail className="h-4 w-4" />
        Feature Guide
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-[#1E1B4B] sm:text-5xl mb-4">
        Broadcast Messages
      </h1>
      <p className="text-xl text-[#1E1B4B]/70 leading-relaxed mb-10 max-w-3xl">
        Send rich, targeted communications to your entire organisation or
        specific groups — instantly or on a schedule. Every message lands in
        the member inbox and, if enabled, also delivers a push notification.
      </p>

      {/* What it does */}
      <section className="bg-white rounded-2xl border border-[#6366F1]/10 p-8 mb-10 shadow-sm">
        <h2 className="text-2xl font-bold text-[#1E1B4B] mb-6">
          What Broadcast Messages do
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            {
              icon: Target,
              title: "Targeted delivery",
              desc: "Choose to reach all members, or narrow your audience to one or more groups (e.g. 'Engineering', 'All Volunteers').",
            },
            {
              icon: Send,
              title: "Instant or scheduled",
              desc: "Send immediately or set a future date and time. Convex's scheduled functions handle the delivery without any server management.",
            },
            {
              icon: Zap,
              title: "Real-time inbox",
              desc: "Messages appear in the member inbox the moment they are sent, powered by Convex's live-query reactive data layer.",
            },
            {
              icon: CheckCircle,
              title: "Immutable record",
              desc: "Sent messages are permanently recorded. Corrections require a new message, maintaining a full audit trail of communications.",
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

      {/* App mockups */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-[#1E1B4B] mb-2">
          The Admin Composer &amp; Member Inbox
        </h2>
        <p className="text-[#1E1B4B]/60 text-sm mb-6">
          Admins compose and send messages from the admin dashboard. Members receive them instantly in their inbox feed.
        </p>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider mb-2">
              Admin — Message Composer
            </p>
            <MessageComposerMockup />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider mb-2">
              Member — Inbox Feed
            </p>
            <InboxMockup />
          </div>
        </div>
      </section>

      {/* How to send a message */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-[#1E1B4B] mb-6">
          How to send a broadcast message
        </h2>
        <div className="space-y-4">
          {[
            {
              step: 1,
              title: "Sign in as Admin",
              detail:
                "Only users with the admin or super_admin role can create messages. Sign in and navigate to the Admin section.",
            },
            {
              step: 2,
              title: "Open the Message Composer",
              detail:
                'From the admin dashboard, click "Messages" in the sidebar, then "New Message" to open the composer.',
            },
            {
              step: 3,
              title: "Choose your audience",
              detail:
                'Select "All Members" for an org-wide broadcast, or pick one or more specific groups to target a subset of your organisation.',
            },
            {
              step: 4,
              title: "Write your message",
              detail:
                "Add a clear subject line and your message body. Keep subjects concise — they appear in push notification previews.",
            },
            {
              step: 5,
              title: "Send now or schedule",
              detail:
                'Click "Send Now" to deliver immediately, or choose "Schedule" to pick a future date and time. Scheduled messages are processed by a Convex cron job.',
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

      {/* Scheduling detail */}
      <section className="mb-10 rounded-xl bg-[#1E1B4B] p-8 text-white">
        <div className="flex items-start gap-4">
          <Calendar className="h-8 w-8 text-[#818CF8] shrink-0 mt-0.5" />
          <div>
            <h2 className="text-xl font-bold mb-2">How message scheduling works</h2>
            <p className="text-white/70 text-sm leading-relaxed mb-4">
              When you schedule a message, Org Comms calls{" "}
              <code className="bg-white/10 px-1 rounded text-xs">ctx.scheduler.runAt()</code>{" "}
              in Convex, storing the{" "}
              <code className="bg-white/10 px-1 rounded text-xs">scheduledFunctionId</code>{" "}
              on the message record. At the scheduled time, Convex automatically
              runs the send function — no cron infrastructure to manage.
            </p>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                Scheduled messages can be cancelled before they send.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                Delivery happens even if no admin is logged in.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                Recipients receive push notifications at the scheduled time.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <FaqSection
        items={[
          {
            q: "Who can send broadcast messages in Org Comms?",
            a: "Only users with the admin or super_admin role can compose and send messages. Regular members can only read messages in their inbox.",
          },
          {
            q: "Can I send a message to a specific team or department?",
            a: "Yes. When composing a message you can target one or more groups instead of all members. Any group you have created in the Group Management section is available as an audience.",
          },
          {
            q: "What happens if I make a mistake in a sent message?",
            a: "Sent messages are immutable — they cannot be edited. To correct an error, send a new message. This design ensures a complete, unmodified audit trail of all communications.",
          },
          {
            q: "How far in advance can I schedule a message?",
            a: "There is no hard limit — you can schedule messages weeks or months ahead. The Convex scheduler persists the job reliably until the chosen time.",
          },
          {
            q: "Do recipients get notified when a message arrives?",
            a: "Yes, if the member has enabled push notifications and has an active push subscription, they will receive a browser or device notification at the moment the message is delivered — or at the scheduled time.",
          },
          {
            q: "Can members reply to broadcast messages?",
            a: "The current boilerplate supports one-way broadcast messaging. Members can read messages but the platform does not include threaded replies or direct messaging.",
          },
        ]}
      />

      {/* CTA */}
      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <Button className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white">
          <Link to="/sign-in" search={{ demo: true } as any} className="flex items-center gap-2">
            Try it in the Demo <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" className="border-[#6366F1]/20 text-[#6366F1] hover:bg-[#6366F1]/10">
          <Link to="/docs/notifications">Next: Push Notifications →</Link>
        </Button>
      </div>
    </DocsPageShell>
  );
}
