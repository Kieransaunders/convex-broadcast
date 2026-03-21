import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle,
  Crown,
  Lock,
  Shield,
  User,
  UserCheck,
  X,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { DocsPageShell, FaqSection } from "~/components/docs-nav";

export const Route = createFileRoute("/docs/role-based-access")({
  component: RoleBasedAccessPage,
  head: () => ({
    meta: [
      {
        title:
          "Role-Based Access Control — Member, Admin & Super Admin Roles | Org Comms",
      },
      {
        name: "description",
        content:
          "Org Comms uses a three-tier role system (member, admin, super_admin) to control who can send messages, manage users, and configure the platform. Learn how roles work.",
      },
    ],
  }),
});

function RolesTableMockup() {
  const roles = [
    { role: "super_admin", badge: "bg-amber-100 text-amber-700", icon: Crown },
    { role: "admin", badge: "bg-[#6366F1]/10 text-[#6366F1]", icon: Shield },
    { role: "member", badge: "bg-green-100 text-green-700", icon: User },
  ];
  const capabilities = [
    { label: "Read inbox messages", super_admin: true, admin: true, member: true },
    { label: "Enable push notifications", super_admin: true, admin: true, member: true },
    { label: "Send broadcast messages", super_admin: true, admin: true, member: false },
    { label: "Schedule messages", super_admin: true, admin: true, member: false },
    { label: "Manage groups", super_admin: true, admin: true, member: false },
    { label: "Manage events", super_admin: true, admin: true, member: false },
    { label: "View delivery tracking", super_admin: true, admin: true, member: false },
    { label: "Manage users & roles", super_admin: true, admin: false, member: false },
    { label: "System settings", super_admin: true, admin: false, member: false },
    { label: "Impersonate users", super_admin: true, admin: false, member: false },
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
          <span className="text-white/40 text-xs font-mono">Role Capabilities Matrix</span>
        </div>
      </div>
      <div className="p-4 overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead>
            <tr>
              <th className="text-left text-[#1E1B4B]/40 font-medium pb-2 pr-3 w-1/2">Capability</th>
              {roles.map(({ role, badge, icon: Icon }) => (
                <th key={role} className="text-center pb-2 px-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold ${badge}`}>
                    <Icon className="h-2.5 w-2.5" />
                    {role.replace("_", " ")}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#6366F1]/5">
            {capabilities.map((cap) => (
              <tr key={cap.label}>
                <td className="py-1.5 pr-3 text-[#1E1B4B]/60">{cap.label}</td>
                {["super_admin", "admin", "member"].map((role) => (
                  <td key={role} className="py-1.5 px-1 text-center">
                    {cap[role as keyof typeof cap] ? (
                      <CheckCircle className="h-3 w-3 text-[#10B981] mx-auto" />
                    ) : (
                      <X className="h-3 w-3 text-[#1E1B4B]/20 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserManagementMockup() {
  const users = [
    { name: "Kieran Saunders", email: "kieran@org.com", role: "super_admin", badge: "bg-amber-100 text-amber-700" },
    { name: "Alice Chen", email: "alice@org.com", role: "admin", badge: "bg-[#6366F1]/10 text-[#6366F1]" },
    { name: "Ben Owens", email: "ben@org.com", role: "member", badge: "bg-green-100 text-green-700" },
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
          <span className="text-white/40 text-xs font-mono">orgcomms.app/admin/users</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-[#1E1B4B]">Users</span>
          <div className="flex items-center gap-1.5 px-2 py-1 border border-[#6366F1]/20 rounded-lg">
            <UserCheck className="h-3 w-3 text-[#6366F1]" />
            <span className="text-[10px] font-medium text-[#6366F1]">Invite</span>
          </div>
        </div>
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.email} className="flex items-center gap-3 p-3 rounded-lg border border-[#6366F1]/8 bg-white">
              <div className="h-7 w-7 rounded-full bg-[#6366F1] flex items-center justify-center shrink-0">
                <span className="text-[9px] font-bold text-white">{u.name.split(" ").map(n => n[0]).join("")}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-[#1E1B4B] truncate">{u.name}</div>
                <div className="text-[9px] text-[#1E1B4B]/40 truncate">{u.email}</div>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${u.badge}`}>
                {u.role.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RoleBasedAccessPage() {
  return (
    <DocsPageShell>
      <div className="inline-flex items-center gap-2 rounded-full bg-[#6366F1]/10 px-4 py-1.5 text-sm font-medium text-[#6366F1] mb-6">
        <Shield className="h-4 w-4" />
        Feature Guide
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-[#1E1B4B] sm:text-5xl mb-4">
        Role-Based Access
      </h1>
      <p className="text-xl text-[#1E1B4B]/70 leading-relaxed mb-10 max-w-3xl">
        Org Comms uses a three-tier permission model to ensure the right people
        have access to the right capabilities. From regular members who receive
        messages to super admins who manage the entire platform.
      </p>

      {/* Three roles */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-[#1E1B4B] mb-6">The Three Roles</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            {
              icon: User,
              role: "member",
              color: "bg-green-50 border-green-200",
              iconBg: "bg-green-100",
              iconColor: "text-green-700",
              tagBg: "bg-green-100 text-green-700",
              description:
                "Standard org members. Can read messages in their inbox, enable push notifications, manage their own settings, and install the PWA.",
              perms: ["Read inbox", "Push notifications", "Account settings"],
            },
            {
              icon: Shield,
              role: "admin",
              color: "bg-[#6366F1]/5 border-[#6366F1]/20",
              iconBg: "bg-[#6366F1]/10",
              iconColor: "text-[#6366F1]",
              tagBg: "bg-[#6366F1]/10 text-[#6366F1]",
              description:
                "Organisation administrators who can create and send messages, manage groups and events, and view delivery analytics.",
              perms: ["All member capabilities", "Send & schedule messages", "Manage groups & events", "View delivery stats"],
            },
            {
              icon: Crown,
              role: "super_admin",
              color: "bg-amber-50 border-amber-200",
              iconBg: "bg-amber-100",
              iconColor: "text-amber-700",
              tagBg: "bg-amber-100 text-amber-700",
              description:
                "Full platform control. Can manage users, assign roles, configure system settings, and impersonate other users for support.",
              perms: ["All admin capabilities", "Manage users & roles", "System settings", "User impersonation"],
            },
          ].map(({ icon: Icon, role, color, iconBg, iconColor, tagBg, description, perms }) => (
            <div
              key={role}
              className={`rounded-xl border p-5 ${color}`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg} mb-3`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tagBg}`}>
                {role.replace("_", " ")}
              </span>
              <p className="text-sm text-[#1E1B4B]/60 leading-relaxed mt-3 mb-3">{description}</p>
              <ul className="space-y-1">
                {perms.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-xs text-[#1E1B4B]/70">
                    <CheckCircle className="h-3 w-3 text-[#10B981] shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Mockups */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-[#1E1B4B] mb-2">
          Capabilities Matrix &amp; User Management
        </h2>
        <p className="text-[#1E1B4B]/60 text-sm mb-6">
          Super admins can view and change user roles from the Users panel in the admin dashboard.
        </p>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider mb-2">
              Capability Matrix
            </p>
            <RolesTableMockup />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider mb-2">
              Admin — User Management
            </p>
            <UserManagementMockup />
          </div>
        </div>
      </section>

      {/* Impersonation callout */}
      <section className="mb-10 rounded-xl bg-[#1E1B4B] p-8 text-white">
        <div className="flex items-start gap-4">
          <Lock className="h-8 w-8 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-xl font-bold mb-2">User Impersonation (super_admin only)</h2>
            <p className="text-white/70 text-sm leading-relaxed mb-4">
              Super admins can impersonate any user account to diagnose issues or provide
              support. All impersonation sessions are recorded in an audit log
              (<code className="bg-white/10 px-1 rounded text-xs">impersonationLogs</code>{" "}
              table) and a visible banner is shown throughout the session to
              prevent accidental actions.
            </p>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                Every impersonation start and end is logged with timestamp and actor ID.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                An orange banner is visible to the impersonating admin at all times.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How to change roles */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-[#1E1B4B] mb-6">How to change a user's role</h2>
        <div className="space-y-4">
          {[
            {
              step: 1,
              title: "Sign in as super_admin",
              detail: "Role management requires super_admin privileges. The first super admin is set via the SUPER_ADMIN_EMAIL environment variable.",
            },
            {
              step: 2,
              title: "Navigate to Admin → Users",
              detail: "The Users section lists all registered accounts with their current role.",
            },
            {
              step: 3,
              title: "Select a user",
              detail: "Click on a user to open their profile. From here you can change their role using the role selector.",
            },
            {
              step: 4,
              title: "Choose the new role and save",
              detail: "Select 'member', 'admin', or 'super_admin' and confirm. The change takes effect immediately on their next action.",
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
            q: "How is the first super admin set up?",
            a: "Set the SUPER_ADMIN_EMAIL environment variable in the Convex dashboard before first launch. The user who registers with that email address is automatically granted super_admin status.",
          },
          {
            q: "Can an admin promote another user to admin?",
            a: "No. Only super_admin users can change roles. Regular admins can manage groups, events, and messages, but cannot alter user permissions.",
          },
          {
            q: "What happens to a user's content if they are demoted?",
            a: "Existing messages and records are not affected by role changes. The user simply loses the ability to perform privileged actions going forward.",
          },
          {
            q: "How does Better Auth integrate with the role system?",
            a: "Org Comms uses the Better Auth admin plugin which extends the session with role information. The Convex backend validates the user's role on every mutation using the session token.",
          },
          {
            q: "Can I invite new members directly to a role?",
            a: "When sending an invite, super admins can choose the target role. Invites are sent via email (Resend integration) and contain a sign-up link that pre-assigns the chosen role.",
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
          <Link to="/docs/event-management">Next: Event Management →</Link>
        </Button>
      </div>
    </DocsPageShell>
  );
}
