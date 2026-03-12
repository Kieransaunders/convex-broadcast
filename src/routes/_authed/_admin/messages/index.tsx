import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { convexQuery } from "@convex-dev/react-query"
import { api } from "../../../../../convex/_generated/api.js"
import { Card, CardContent } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Mail, Plus, ArrowRight, FileText, Send, Clock } from "lucide-react"

export const Route = createFileRoute("/_authed/_admin/messages/")({
  component: MessagesPage,
})

function MessagesPage() {
  const { data: allMessages, isLoading } = useQuery(convexQuery(api.messages.list, {}))

  const drafts = allMessages?.filter((m) => m.status === "draft") || []
  const scheduled = allMessages?.filter((m) => m.status === "scheduled") || []
  const sent = allMessages?.filter((m) => m.status === "sent" || m.status === "archived") || []

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "urgent":
        return "bg-red-100 text-red-700"
      case "event_update":
        return "bg-blue-100 text-blue-700"
      case "reminder":
        return "bg-yellow-100 text-yellow-700"
      case "notice":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "urgent":
        return "🔴"
      case "event_update":
        return "📅"
      case "reminder":
        return "⏰"
      case "notice":
        return "📢"
      default:
        return "📄"
    }
  }

  const MessageList = ({
    messages,
    emptyText,
  }: {
    messages: typeof allMessages
    emptyText: string
  }) => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-[#6366F1]/10">
              <CardContent className="p-6">
                <div className="h-6 w-1/3 bg-gray-100 rounded animate-pulse mb-2" />
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    if (!messages || messages.length === 0) {
      return (
        <Card className="border-[#6366F1]/10">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-[#6366F1]/30" />
            <p className="mt-4 text-lg font-medium text-[#1E1B4B]">{emptyText}</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        {messages.map((message) => (
          <Link key={message._id} to="/messages/detail" search={{ id: message._id }}>
            <Card className="border-[#6366F1]/10 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getCategoryIcon(message.category)}</span>
                      <h3 className="font-semibold text-[#1E1B4B] truncate">{message.title}</h3>
                    </div>
                    <p className="text-sm text-[#1E1B4B]/60 line-clamp-2">{message.body}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge className={getCategoryColor(message.category)}>
                        {message.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`${message.pushEnabled
                          ? "border-green-200 text-green-700"
                          : "border-gray-200 text-gray-500"
                          }`}
                      >
                        {message.pushEnabled ? "🔔 Push" : "📧 Email only"}
                      </Badge>
                      {message.audienceType && (
                        <Badge variant="outline" className="border-[#6366F1]/20 text-[#6366F1]">
                          To: {message.audienceType}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[#6366F1]/40 ml-4 flex-shrink-0" />
                </div>
                {message.scheduledFor && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-[#1E1B4B]/60">
                    <Clock className="h-4 w-4" />
                    <span>
                      Scheduled for{" "}
                      {new Date(message.scheduledFor).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
                {message.sentAt && (
                  <div className="mt-3 text-sm text-[#1E1B4B]/60">
                    Sent {new Date(message.sentAt).toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1E1B4B]">Messages</h1>
          <p className="text-[#1E1B4B]/60 mt-1">
            Create and manage messages to your organization.
          </p>
        </div>
        <Button className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white">
          <Link to="/messages/new" className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            New Message
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="drafts" className="space-y-6">
        <TabsList className="bg-white border border-[#6366F1]/10">
          <TabsTrigger
            value="drafts"
            className="data-[state=active]:bg-[#6366F1] data-[state=active]:text-white"
          >
            <FileText className="mr-2 h-4 w-4" />
            Drafts
            {drafts.length > 0 && (
              <span className="ml-2 rounded-full bg-[#6366F1]/10 px-2 py-0.5 text-xs">
                {drafts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="scheduled"
            className="data-[state=active]:bg-[#6366F1] data-[state=active]:text-white"
          >
            <Clock className="mr-2 h-4 w-4" />
            Scheduled
            {scheduled.length > 0 && (
              <span className="ml-2 rounded-full bg-[#6366F1]/10 px-2 py-0.5 text-xs">
                {scheduled.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="sent"
            className="data-[state=active]:bg-[#6366F1] data-[state=active]:text-white"
          >
            <Send className="mr-2 h-4 w-4" />
            Sent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drafts">
          <MessageList messages={drafts} emptyText="No draft messages" />
        </TabsContent>

        <TabsContent value="scheduled">
          <MessageList messages={scheduled} emptyText="No scheduled messages" />
        </TabsContent>

        <TabsContent value="sent">
          <MessageList messages={sent} emptyText="No sent messages yet" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
