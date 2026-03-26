import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle,
  Plus,
  Search,
  Tag,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { DocsPageShell, FaqSection } from "~/components/docs-nav";

export const Route = createFileRoute("/docs/group-management")({
  component: GroupManagementPage,
  head: () => ({
    meta: [
      {
        title:
          "Group Management — Organise Members for Targeted Messaging | Org Comms",
      },
      {
        name: "description",
        content:
          "Learn how to create and manage groups in Org Comms. Segment your organisation into teams, departments, or event cohorts and send precisely targeted broadcasts.",
      },
    ],
  }),
});

function GroupListMockup() {
  const groups = [
    { name: "Engineering", members: 12, color: "bg-blue-100 text-blue-700" },
    { name: "Marketing", members: 7, color: "bg-pink-100 text-pink-700" },
    { name: "Volunteers", members: 34, color: "bg-green-100 text-green-700" },
    { name: "Leadership", members: 4, color: "bg-amber-100 text-amber-700" },
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
          <span className="text-white/40 text-xs font-mono">orgcomms.app/admin/groups</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-[#1E1B4B]">Groups</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#6366F1] rounded-lg">
            <Plus className="h-3 w-3 text-white" />
            <span className="text-[10px] font-semibold text-white">New Group</span>
          </div>
        </div>
        {/* Search */}
        <div className="flex items-center gap-2 border border-[#6366F1]/15 rounded-lg px-2.5 py-1.5 mb-3 bg-[#F5F3FF]">
          <Search className="h-3 w-3 text-[#6366F1]/50" />
          <span className="text-[10px] text-[#1E1B4B]/30">Search groups…</span>
        </div>
        <div className="space-y-2">
          {groups.map((g) => (
            <div
              key={g.name}
              className="flex items-center justify-between p-3 rounded-lg border border-[#6366F1]/8 hover:border-[#6366F1]/20 bg-white"
            >
              <div className="flex items-center gap-2.5">
                <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${g.color}`}>
                  {g.name}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-[#1E1B4B]/40">
                <Users className="h-3 w-3" />
                {g.members} members
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GroupDetailMockup() {
  const members = [
    { name: "Alice Chen", role: "admin", initials: "AC" },
    { name: "Ben Owens", role: "member", initials: "BO" },
    { name: "Clara Diaz", role: "member", initials: "CD" },
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
          <span className="text-white/40 text-xs font-mono">orgcomms.app/admin/groups/engineering</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <span className="text-sm font-bold text-[#1E1B4B]">Engineering</span>
            <div className="text-[10px] text-[#1E1B4B]/40 mt-0.5">12 members · created Jan 2025</div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 border border-[#6366F1]/20 rounded-lg">
            <UserPlus className="h-3 w-3 text-[#6366F1]" />
            <span className="text-[10px] font-medium text-[#6366F1]">Add</span>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {members.map((m) => (
            <div
              key={m.name}
              className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#F5F3FF]"
            >
              <div className="h-7 w-7 rounded-full bg-[#6366F1] flex items-center justify-center shrink-0">
                <span className="text-[9px] font-bold text-white">{m.initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-[#1E1B4B] truncate">{m.name}</div>
              </div>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                  m.role === "admin"
                    ? "bg-[#6366F1]/10 text-[#6366F1]"
                    : "bg-[#1E1B4B]/8 text-[#1E1B4B]/40"
                }`}
              >
                {m.role}
              </span>
            </div>
          ))}
          <div className="text-[9px] text-[#1E1B4B]/30 text-center pt-1">+ 9 more members</div>
        </div>
      </div>
    </div>
  );
}

function GroupManagementPage() {
  return (
    <DocsPageShell>
      <div className="inline-flex items-center gap-2 rounded-full bg-[#6366F1]/10 px-4 py-1.5 text-sm font-medium text-[#6366F1] mb-6">
        <Users className="h-4 w-4" />
        Feature Guide
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-[#1E1B4B] sm:text-5xl mb-4">
        Group Management
      </h1>
      <p className="text-xl text-[#1E1B4B]/70 leading-relaxed mb-10 max-w-3xl">
        Organise your members into logical groups and use those groups to send
        precisely targeted broadcasts. Instead of messaging everyone for every
        announcement, you can reach only the people who need to know.
      </p>

      {/* Capabilities */}
      <section className="bg-white rounded-2xl border border-[#6366F1]/10 p-8 mb-10 shadow-sm">
        <h2 className="text-2xl font-bold text-[#1E1B4B] mb-6">
          What Group Management enables
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            {
              icon: Tag,
              title: "Flexible segmentation",
              desc: "Create groups for departments, teams, event cohorts, or any logical unit. There's no limit on the number of groups.",
            },
            {
              icon: Users,
              title: "Member assignment",
              desc: "Add or remove individual members from groups at any time. Members can belong to multiple groups simultaneously.",
            },
            {
              icon: CheckCircle,
              title: "Targeted messaging",
              desc: "When composing a message, select one or more groups as the audience. Only those members will receive the broadcast.",
            },
            {
              icon: ArrowRight,
              title: "Event integration",
              desc: "Groups can be linked to events, making it easy to notify all attendees of a particular event with a single action.",
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
          Groups List &amp; Group Detail
        </h2>
        <p className="text-[#1E1B4B]/60 text-sm mb-6">
          Browse all groups from the admin panel and drill into any group to manage its members.
        </p>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider mb-2">
              Admin — Groups List
            </p>
            <GroupListMockup />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider mb-2">
              Admin — Group Detail
            </p>
            <GroupDetailMockup />
          </div>
        </div>
      </section>

      {/* How to */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-[#1E1B4B] mb-6">
          How to create and manage a group
        </h2>
        <div className="space-y-4">
          {[
            {
              step: 1,
              title: "Navigate to Admin → Groups",
              detail: "From the admin dashboard sidebar, click 'Groups' to see all existing groups.",
            },
            {
              step: 2,
              title: "Create a new group",
              detail: "Click 'New Group', enter a clear name (e.g. 'Marketing Team', 'Volunteers 2025') and save.",
            },
            {
              step: 3,
              title: "Add members",
              detail: "Open the group detail view and use the 'Add Member' control to search for and add registered users.",
            },
            {
              step: 4,
              title: "Use the group as a message audience",
              detail: "When composing a broadcast message, select this group in the Audience picker. Only group members will receive it.",
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
            q: "How many groups can I create?",
            a: "There is no built-in limit. Create as many groups as your organisation needs — by department, project, location, or any other segmentation.",
          },
          {
            q: "Can a member belong to multiple groups?",
            a: "Yes. Members can be in as many groups as appropriate. If a message targets multiple groups and a member is in more than one, they receive the message only once.",
          },
          {
            q: "Can members see which groups they belong to?",
            a: "The current member inbox view doesn't expose group membership details. Members simply see messages in their feed without information about which group targeting was used.",
          },
          {
            q: "Who can create and manage groups?",
            a: "Only admin and super_admin users can create groups, edit group names, and add or remove members from groups.",
          },
          {
            q: "What happens if I delete a group?",
            a: "Deleting a group removes the group and all its membership records. Previously sent messages that targeted the group are not affected — they remain in recipients' inboxes.",
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
          <Link to="/docs/role-based-access">Next: Role-Based Access →</Link>
        </Button>
      </div>
    </DocsPageShell>
  );
}
