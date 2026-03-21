import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  Globe,
  MapPin,
  Users,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { DocsPageShell, FaqSection } from "~/components/docs-nav";

export const Route = createFileRoute("/docs/event-management")({
  component: EventManagementPage,
  head: () => ({
    meta: [
      {
        title:
          "Event Management — Schedule Events & Notify Attendees | Org Comms",
      },
      {
        name: "description",
        content:
          "Create and manage organisation events in Org Comms. Automatically notify all attendees with broadcast messages and push notifications when events are created or updated.",
      },
    ],
  }),
});

function EventListMockup() {
  const events = [
    {
      name: "Q3 Town Hall",
      date: "28 Mar 2026",
      time: "10:00",
      attendees: 47,
      status: "upcoming",
    },
    {
      name: "Team Training Day",
      date: "15 Apr 2026",
      time: "09:00",
      attendees: 12,
      status: "upcoming",
    },
    {
      name: "Annual Away Day",
      date: "5 Mar 2026",
      time: "08:30",
      attendees: 34,
      status: "past",
    },
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
          <span className="text-white/40 text-xs font-mono">orgcomms.app/admin/events</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-[#1E1B4B]">Events</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#6366F1] rounded-lg">
            <Calendar className="h-3 w-3 text-white" />
            <span className="text-[10px] font-semibold text-white">New Event</span>
          </div>
        </div>
        <div className="space-y-2">
          {events.map((e) => (
            <div
              key={e.name}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                e.status === "upcoming"
                  ? "border-[#6366F1]/15 bg-white"
                  : "border-[#1E1B4B]/8 bg-[#F5F3FF]/50 opacity-60"
              }`}
            >
              <div className="flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-lg bg-[#6366F1]/10">
                <span className="text-[8px] font-bold text-[#6366F1] leading-none">
                  {e.date.split(" ")[0]}
                </span>
                <span className="text-[7px] text-[#6366F1]/60">
                  {e.date.split(" ")[1]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-[#1E1B4B] truncate">{e.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-0.5 text-[9px] text-[#1E1B4B]/40">
                    <Clock className="h-2.5 w-2.5" />
                    {e.time}
                  </span>
                  <span className="flex items-center gap-0.5 text-[9px] text-[#1E1B4B]/40">
                    <Users className="h-2.5 w-2.5" />
                    {e.attendees}
                  </span>
                </div>
              </div>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                  e.status === "upcoming"
                    ? "bg-green-100 text-green-700"
                    : "bg-[#1E1B4B]/8 text-[#1E1B4B]/40"
                }`}
              >
                {e.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EventDetailMockup() {
  return (
    <div className="rounded-xl overflow-hidden border border-[#6366F1]/15 shadow-lg bg-white">
      <div className="bg-[#1E1B4B] px-4 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400/80" />
          <div className="h-3 w-3 rounded-full bg-amber-400/80" />
          <div className="h-3 w-3 rounded-full bg-green-400/80" />
        </div>
        <div className="flex-1 flex justify-center">
          <span className="text-white/40 text-xs font-mono">Q3 Town Hall — Event Detail</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-[#6366F1]">
            <span className="text-[10px] font-bold text-white leading-none">28</span>
            <span className="text-[8px] text-white/70">Mar</span>
          </div>
          <div>
            <div className="text-sm font-bold text-[#1E1B4B]">Q3 Town Hall</div>
            <div className="flex items-center gap-1 text-[10px] text-[#1E1B4B]/50 mt-0.5">
              <Clock className="h-3 w-3" />
              10:00 – 11:30
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[#1E1B4B]/50 mt-0.5">
              <MapPin className="h-3 w-3" />
              Main Conference Room
            </div>
          </div>
        </div>
        {/* Attendees */}
        <div className="bg-[#F5F3FF] rounded-lg p-3 mb-3">
          <div className="text-[10px] font-semibold text-[#1E1B4B]/50 uppercase tracking-wide mb-2">Attendees (47)</div>
          <div className="flex gap-1 flex-wrap">
            {["AC", "BO", "CD", "EF", "GH", "+42"].map((init) => (
              <div
                key={init}
                className="h-6 w-6 rounded-full bg-[#6366F1] flex items-center justify-center"
              >
                <span className="text-[8px] font-bold text-white">{init}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Notify button */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-[#6366F1] rounded-lg w-fit">
          <Bell className="h-3 w-3 text-white" />
          <span className="text-[10px] font-semibold text-white">Notify Attendees</span>
        </div>
      </div>
    </div>
  );
}

function EventManagementPage() {
  return (
    <DocsPageShell>
      <div className="inline-flex items-center gap-2 rounded-full bg-[#6366F1]/10 px-4 py-1.5 text-sm font-medium text-[#6366F1] mb-6">
        <Globe className="h-4 w-4" />
        Feature Guide
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-[#1E1B4B] sm:text-5xl mb-4">
        Event Management
      </h1>
      <p className="text-xl text-[#1E1B4B]/70 leading-relaxed mb-10 max-w-3xl">
        Create organisation events, build attendee lists, and send targeted
        notifications to everyone registered for a given event — all from the
        admin dashboard.
      </p>

      <section className="bg-white rounded-2xl border border-[#6366F1]/10 p-8 mb-10 shadow-sm">
        <h2 className="text-2xl font-bold text-[#1E1B4B] mb-6">
          What Event Management provides
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            {
              icon: Calendar,
              title: "Event creation",
              desc: "Create named events with a date, time, location, and optional description. Events appear on a searchable admin list.",
            },
            {
              icon: Users,
              title: "Attendee management",
              desc: "Add individual members or entire groups to an event's attendee list. Remove attendees as plans change.",
            },
            {
              icon: Bell,
              title: "Targeted notifications",
              desc: "Notify all event attendees with a broadcast message — optionally triggering push notifications to their devices.",
            },
            {
              icon: CheckCircle,
              title: "Event history",
              desc: "Past events remain in the system for reference. View historical attendee lists and any messages sent to that event audience.",
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
          Events List &amp; Event Detail
        </h2>
        <p className="text-[#1E1B4B]/60 text-sm mb-6">
          Manage all events from the admin panel and reach every attendee with a single click.
        </p>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider mb-2">
              Admin — Events List
            </p>
            <EventListMockup />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider mb-2">
              Admin — Event Detail
            </p>
            <EventDetailMockup />
          </div>
        </div>
      </section>

      {/* How to */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-[#1E1B4B] mb-6">
          How to create an event and notify attendees
        </h2>
        <div className="space-y-4">
          {[
            {
              step: 1,
              title: "Navigate to Admin → Events",
              detail: "Open the admin dashboard and click 'Events' in the sidebar to see all upcoming and past events.",
            },
            {
              step: 2,
              title: "Create a new event",
              detail: "Click 'New Event', fill in the name, date, time, and optional location. Save to create the event.",
            },
            {
              step: 3,
              title: "Add attendees",
              detail: "From the event detail view, add individual members or entire groups. Members added to the event will receive relevant broadcasts.",
            },
            {
              step: 4,
              title: "Notify attendees",
              detail: "Use the 'Notify Attendees' action to send a broadcast message (and optionally a push notification) to everyone on the attendee list.",
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
            q: "What is the difference between a Group and an Event in Org Comms?",
            a: "Groups are persistent member segments (e.g. 'Engineering Team') that you message repeatedly. Events are time-bound occurrences (e.g. 'Annual Conference') with their own attendee list, which may or may not overlap with your groups.",
          },
          {
            q: "Can I use a group as an event attendee list?",
            a: "Yes. When adding attendees to an event you can add an entire group at once. The group's members at the time of adding become attendees — the event and group then remain independent.",
          },
          {
            q: "Are attendees notified automatically when an event is created?",
            a: "No. Creating an event does not automatically send a notification. You explicitly trigger notifications from the event detail view using the 'Notify Attendees' action, giving you full control over timing.",
          },
          {
            q: "Can members see a list of events they are attending?",
            a: "In the current boilerplate, members receive notifications and inbox messages about events but there is no dedicated 'My Events' calendar view in the member interface.",
          },
          {
            q: "Who can create and manage events?",
            a: "Users with admin or super_admin roles can create, edit, and manage events and their attendee lists.",
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
          <Link to="/docs/delivery-tracking">Next: Delivery Tracking →</Link>
        </Button>
      </div>
    </DocsPageShell>
  );
}
