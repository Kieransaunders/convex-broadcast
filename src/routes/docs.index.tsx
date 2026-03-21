import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart2,
  Bell,
  BookOpen,
  CheckCircle,
  Globe,
  Mail,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { DocsPageShell } from "~/components/docs-nav";

export const Route = createFileRoute("/docs/")({
  component: DocsIndexPage,
  head: () => ({
    meta: [
      {
        title: "Org Comms Documentation — Organization Communication Platform",
      },
      {
        name: "description",
        content:
          "Complete documentation for Org Comms: learn how broadcast messaging, push notifications, group management, role-based access, event scheduling, and delivery tracking work together to power your organization's communications.",
      },
    ],
  }),
});

const FEATURES = [
  {
    to: "/docs/broadcast-messages",
    icon: Mail,
    title: "Broadcast Messages",
    description:
      "Send rich messages instantly to your entire organization or target specific groups. Schedule messages in advance and reach everyone across devices.",
    tags: ["Messaging", "Targeting", "Scheduling"],
  },
  {
    to: "/docs/notifications",
    icon: Bell,
    title: "Push Notifications",
    description:
      "Deliver real-time alerts to members even when the app isn't open. Works on desktop and mobile via Web Push and Service Workers.",
    tags: ["Web Push", "PWA", "Alerts"],
  },
  {
    to: "/docs/group-management",
    icon: Users,
    title: "Group Management",
    description:
      "Organize members into logical groups — departments, teams, project cohorts — and target communications precisely where they need to go.",
    tags: ["Groups", "Members", "Segmentation"],
  },
  {
    to: "/docs/role-based-access",
    icon: Shield,
    title: "Role-Based Access",
    description:
      "Three-tier permission system (member, admin, super_admin) ensures only authorised users can send messages or manage your organization.",
    tags: ["Permissions", "Security", "Admin"],
  },
  {
    to: "/docs/event-management",
    icon: Globe,
    title: "Event Management",
    description:
      "Create events, manage attendee lists, and automatically notify all participants. Perfect for meetings, training sessions, and org-wide events.",
    tags: ["Events", "Scheduling", "Attendees"],
  },
  {
    to: "/docs/delivery-tracking",
    icon: BarChart2,
    title: "Delivery Tracking",
    description:
      "Real-time delivery and read receipts for every message. Know exactly who has seen your communications and follow up where needed.",
    tags: ["Analytics", "Read Receipts", "Stats"],
  },
] as const;

function DocsIndexPage() {
  return (
    <DocsPageShell>
      {/* Hero */}
      <section className="mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#6366F1]/10 px-4 py-1.5 text-sm font-medium text-[#6366F1] mb-6">
          <BookOpen className="h-4 w-4" />
          Documentation
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1E1B4B] sm:text-5xl mb-4">
          Org Comms Feature Guide
        </h1>
        <p className="text-xl text-[#1E1B4B]/70 leading-relaxed max-w-3xl">
          Everything you need to know about the Org Comms platform. Each guide
          covers a core feature with step-by-step instructions, configuration
          details, and answers to common questions.
        </p>

        <div className="flex flex-wrap gap-3 mt-8">
          <Button className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white">
            <Link to="/sign-in" className="flex items-center gap-2">
              Open App
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" className="border-[#6366F1]/20 text-[#6366F1] hover:bg-[#6366F1]/10">
            <Link to="/sign-in" search={{ demo: true } as any}>
              Try Demo
            </Link>
          </Button>
        </div>
      </section>

      {/* What is Org Comms */}
      <section className="bg-white rounded-2xl border border-[#6366F1]/10 p-8 mb-12 shadow-sm">
        <h2 className="text-2xl font-bold text-[#1E1B4B] mb-4">
          What is Org Comms?
        </h2>
        <p className="text-[#1E1B4B]/70 leading-relaxed mb-4">
          <strong>Org Comms</strong> is an open-source, single-organisation
          broadcast messaging platform built on React 19, TanStack Start, and
          Convex. It is designed to be deployed once per organisation, giving
          admins a powerful channel to reach every member with targeted
          messages, push notifications, and event updates — without the
          complexity or cost of multi-tenant SaaS tools.
        </p>
        <p className="text-[#1E1B4B]/70 leading-relaxed">
          The platform is a Progressive Web App (PWA), meaning members can
          install it to their home screen on iOS and Android and receive
          notifications just like a native application.
        </p>

        <div className="grid gap-4 sm:grid-cols-3 mt-6">
          {[
            { icon: Zap, label: "Real-time delivery via Convex" },
            { icon: CheckCircle, label: "Full read-receipt tracking" },
            { icon: Shield, label: "Role-based admin controls" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-lg bg-[#F5F3FF] px-4 py-3"
            >
              <Icon className="h-5 w-5 text-[#6366F1] shrink-0" />
              <span className="text-sm font-medium text-[#1E1B4B]">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Cards */}
      <section>
        <h2 className="text-2xl font-bold text-[#1E1B4B] mb-6">
          Explore the Features
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.to} to={feature.to as any}>
                <Card className="border-[#6366F1]/10 bg-white hover:shadow-lg hover:border-[#6366F1]/30 transition-all group h-full">
                  <CardContent className="pt-6 pb-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#6366F1]/10 group-hover:bg-[#6366F1]/20 transition-colors">
                        <Icon className="h-5 w-5 text-[#6366F1]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-base font-semibold text-[#1E1B4B]">
                            {feature.title}
                          </h3>
                          <ArrowRight className="h-4 w-4 text-[#6366F1]/40 group-hover:text-[#6366F1] transition-colors shrink-0" />
                        </div>
                        <p className="text-sm text-[#1E1B4B]/60 mt-1 leading-relaxed">
                          {feature.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {feature.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 rounded-full bg-[#6366F1]/8 text-[#6366F1] font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quick start CTA */}
      <section className="mt-12 rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#818CF8] p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Ready to get started?</h2>
        <p className="text-white/80 mb-6 max-w-xl">
          Try the live demo with pre-loaded sample data, or deploy your own
          instance in minutes using the open-source boilerplate.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button className="bg-white text-[#6366F1] hover:bg-white/90">
            <Link to="/sign-in" search={{ demo: true } as any} className="flex items-center gap-2">
              Try Demo <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <a
            href="https://github.com/Kieransaunders/convex-broadcast"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white border border-white/30 hover:bg-white/10 transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </section>
    </DocsPageShell>
  );
}
