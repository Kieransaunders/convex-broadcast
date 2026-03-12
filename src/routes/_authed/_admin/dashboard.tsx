import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { convexQuery } from "@convex-dev/react-query"
import { api } from "../../../../convex/_generated/api.js"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Users, Mail, Eye } from "lucide-react"
import { Skeleton } from "~/components/ui/skeleton"

export const Route = createFileRoute("/_authed/_admin/dashboard")({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: users, isLoading: usersLoading } = useQuery(convexQuery(api.users.list, {}))
  const { data: messages, isLoading: messagesLoading } = useQuery(
    convexQuery(api.messages.list, {})
  )

  const totalUsers = users?.length || 0
  const totalMessages = messages?.length || 0
  const sentMessages = messages?.filter((m) => m.status === "sent").length || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1E1B4B]">Dashboard</h1>
        <p className="text-[#1E1B4B]/60 mt-1">
          Welcome to your organization&apos;s communication hub.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          loading={usersLoading}
          href="/users"
        />
        <StatCard
          title="Messages Sent"
          value={sentMessages}
          icon={Mail}
          loading={messagesLoading}
          href="/messages"
        />
        <StatCard
          title="Total Messages"
          value={totalMessages}
          icon={Eye}
          loading={messagesLoading}
          href="/messages"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[#6366F1]/10">
          <CardHeader>
            <CardTitle className="text-lg text-[#1E1B4B]">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <QuickActionLink href="/messages/new" label="Send a new message" />
            <QuickActionLink href="/users" label="Invite a team member" />
            <QuickActionLink href="/events" label="Create an event" />
            <QuickActionLink href="/groups" label="Manage groups" />
          </CardContent>
        </Card>

        <Card className="border-[#6366F1]/10">
          <CardHeader>
            <CardTitle className="text-lg text-[#1E1B4B]">Recent Messages</CardTitle>
          </CardHeader>
          <CardContent>
            {messagesLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : messages && messages.length > 0 ? (
              <div className="space-y-3">
                {messages.slice(0, 5).map((message) => (
                  <Link
                    key={message._id}
                    to="/messages/detail"
                    search={{ id: message._id }}
                    className="flex items-center justify-between rounded-lg p-3 hover:bg-[#6366F1]/5 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#1E1B4B] truncate">{message.title}</p>
                      <p className="text-sm text-[#1E1B4B]/60 capitalize">{message.status}</p>
                    </div>
                    <span
                      className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        message.status === "sent"
                          ? "bg-green-100 text-green-700"
                          : message.status === "draft"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {message.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-[#1E1B4B]/60 text-sm">
                No messages yet.{" "}
                <Link to="/messages/new" className="text-[#6366F1] hover:underline">
                  Create your first message
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  loading,
  href,
}: {
  title: string
  value: number
  icon: React.ElementType
  loading: boolean
  href: string
}) {
  return (
    <Link to={href}>
      <Card className="border-[#6366F1]/10 hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6366F1]/10">
              <Icon className="h-6 w-6 text-[#6366F1]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1E1B4B]/60">{title}</p>
              {loading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-3xl font-bold text-[#1E1B4B]">{value}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function QuickActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      to={href}
      className="flex items-center justify-between rounded-lg border border-[#6366F1]/10 p-3 hover:bg-[#6366F1]/5 hover:border-[#6366F1]/30 transition-colors"
    >
      <span className="text-[#1E1B4B]">{label}</span>
      <svg
        className="h-4 w-4 text-[#6366F1]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}
