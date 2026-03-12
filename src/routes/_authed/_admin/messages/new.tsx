import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useQuery, useMutation } from "@tanstack/react-query"
import { convexQuery } from "@convex-dev/react-query"
import { api } from "../../../../../convex/_generated/api.js"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { Checkbox } from "~/components/ui/checkbox"
import { Badge } from "~/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import {
  ArrowLeft,
  Save,
  Loader2,
  FileText,
  Bell,
  Users,
  FolderOpen,
  CalendarDays,
  Search,
  X,
  Check,
  Globe,
} from "lucide-react"
import { Link } from "@tanstack/react-router"
import { useState, useMemo } from "react"
import { useConvex } from "convex/react"

export const Route = createFileRoute("/_authed/_admin/messages/new")({
  component: NewMessagePage,
})

type AudienceType = "all" | "groups" | "event"

function NewMessagePage() {
  const router = useRouter()
  const convex = useConvex()

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [category, setCategory] = useState<"notice" | "reminder" | "event_update" | "urgent">(
    "notice"
  )
  const [audienceType, setAudienceType] = useState<AudienceType>("all")
  const [pushEnabled, setPushEnabled] = useState(false)

  // Group selection state
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set())
  const [groupSearch, setGroupSearch] = useState("")

  // Event selection state
  const [selectedEventId, setSelectedEventId] = useState<string>("")
  const [eventSearch, setEventSearch] = useState("")

  const { data: groups, isLoading: groupsLoading } = useQuery(
    convexQuery(api.groups.list, {})
  )
  const { data: events, isLoading: eventsLoading } = useQuery(
    convexQuery(api.events.list, {})
  )

  const createMutation = useMutation({
    mutationFn: async (data: {
      title: string
      body: string
      category: "notice" | "reminder" | "event_update" | "urgent"
      audienceType: "all" | "groups" | "event"
      pushEnabled: boolean
      targetIds?: string[]
    }) => {
      return await convex.mutation(api.messages.create, data)
    },
    onSuccess: (messageId) => {
      router.navigate({ to: "/messages/detail", search: { id: messageId } })
    },
  })

  // Filter groups by search
  const filteredGroups = useMemo(() => {
    if (!groups) return []
    if (!groupSearch.trim()) return groups
    const query = groupSearch.toLowerCase()
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(query) ||
        g.description.toLowerCase().includes(query)
    )
  }, [groups, groupSearch])

  // Filter events by search
  const filteredEvents = useMemo(() => {
    if (!events) return []
    if (!eventSearch.trim()) return events
    const query = eventSearch.toLowerCase()
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.location.toLowerCase().includes(query)
    )
  }, [events, eventSearch])

  const selectedGroups = useMemo(() => {
    return groups?.filter((g) => selectedGroupIds.has(g._id)) || []
  }, [groups, selectedGroupIds])

  const selectedEvent = useMemo(() => {
    return events?.find((e) => e._id === selectedEventId)
  }, [events, selectedEventId])

  const handleToggleGroup = (groupId: string) => {
    setSelectedGroupIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId)
      } else {
        newSet.add(groupId)
      }
      return newSet
    })
  }

  const handleSelectAllGroups = () => {
    if (filteredGroups.every((g) => selectedGroupIds.has(g._id))) {
      setSelectedGroupIds((prev) => {
        const newSet = new Set(prev)
        filteredGroups.forEach((g) => newSet.delete(g._id))
        return newSet
      })
    } else {
      setSelectedGroupIds((prev) => {
        const newSet = new Set(prev)
        filteredGroups.forEach((g) => newSet.add(g._id))
        return newSet
      })
    }
  }

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault()
    
    let targetIds: string[] | undefined
    if (audienceType === "groups") {
      targetIds = Array.from(selectedGroupIds)
    } else if (audienceType === "event" && selectedEventId) {
      targetIds = [selectedEventId]
    }

    createMutation.mutate({
      title,
      body,
      category,
      audienceType,
      pushEnabled,
      targetIds,
    })
  }

  const isValid = () => {
    if (!title.trim() || !body.trim()) return false
    if (audienceType === "groups" && selectedGroupIds.size === 0) return false
    if (audienceType === "event" && !selectedEventId) return false
    return true
  }

  const getAudienceSummary = () => {
    switch (audienceType) {
      case "all":
        return "All members will receive this message"
      case "groups":
        return selectedGroupIds.size === 0
          ? "Select at least one group"
          : `${selectedGroupIds.size} group${selectedGroupIds.size === 1 ? "" : "s"} selected`
      case "event":
        return selectedEventId
          ? `Event: ${selectedEvent?.title || "Selected"}`
          : "Select an event"
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-[#1E1B4B]">
          <Link to="/messages">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-[#1E1B4B]">New Message</h1>
          <p className="text-[#1E1B4B]/60 mt-1">Create a new message to send to your organization.</p>
        </div>
      </div>

      <form onSubmit={handleCreateDraft} className="space-y-6">
        {/* Message Content Card */}
        <Card className="border-[#6366F1]/10">
          <CardHeader>
            <CardTitle className="text-lg text-[#1E1B4B]">Message Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-[#1E1B4B]">
                Title
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1E1B4B]/40" />
                <Input
                  id="title"
                  placeholder="Enter message title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="pl-10 border-[#6366F1]/20 focus:border-[#6366F1] focus:ring-[#6366F1]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body" className="text-[#1E1B4B]">
                Message Body
              </Label>
              <Textarea
                id="body"
                placeholder="Write your message here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[150px] border-[#6366F1]/20 focus:border-[#6366F1] focus:ring-[#6366F1]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-[#1E1B4B]">
                Category
              </Label>
              <Select
                value={category}
                onValueChange={(value) => {
                  if (
                    value === "notice" ||
                    value === "reminder" ||
                    value === "event_update" ||
                    value === "urgent"
                  ) {
                    setCategory(value)
                  }
                }}
              >
                <SelectTrigger className="border-[#6366F1]/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="notice">📢 Notice</SelectItem>
                  <SelectItem value="reminder">⏰ Reminder</SelectItem>
                  <SelectItem value="event_update">📅 Event Update</SelectItem>
                  <SelectItem value="urgent">🔴 Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Audience Selection Card */}
        <Card className="border-[#6366F1]/10">
          <CardHeader>
            <CardTitle className="text-lg text-[#1E1B4B]">Audience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Audience Type Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setAudienceType("all")}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                  audienceType === "all"
                    ? "border-[#6366F1] bg-[#6366F1]/5"
                    : "border-gray-200 hover:border-[#6366F1]/30 hover:bg-gray-50"
                }`}
              >
                <div className={`p-3 rounded-full ${audienceType === "all" ? "bg-[#6366F1]" : "bg-gray-100"}`}>
                  <Globe className={`h-6 w-6 ${audienceType === "all" ? "text-white" : "text-gray-500"}`} />
                </div>
                <div className="text-center">
                  <p className={`font-medium ${audienceType === "all" ? "text-[#6366F1]" : "text-[#1E1B4B]"}`}>
                    All Members
                  </p>
                  <p className="text-sm text-gray-500">Send to everyone</p>
                </div>
                {audienceType === "all" && (
                  <Check className="h-5 w-5 text-[#6366F1]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setAudienceType("groups")}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                  audienceType === "groups"
                    ? "border-[#6366F1] bg-[#6366F1]/5"
                    : "border-gray-200 hover:border-[#6366F1]/30 hover:bg-gray-50"
                }`}
              >
                <div className={`p-3 rounded-full ${audienceType === "groups" ? "bg-[#6366F1]" : "bg-gray-100"}`}>
                  <FolderOpen className={`h-6 w-6 ${audienceType === "groups" ? "text-white" : "text-gray-500"}`} />
                </div>
                <div className="text-center">
                  <p className={`font-medium ${audienceType === "groups" ? "text-[#6366F1]" : "text-[#1E1B4B]"}`}>
                    Groups
                  </p>
                  <p className="text-sm text-gray-500">Select groups</p>
                </div>
                {audienceType === "groups" && (
                  <Check className="h-5 w-5 text-[#6366F1]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setAudienceType("event")}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                  audienceType === "event"
                    ? "border-[#6366F1] bg-[#6366F1]/5"
                    : "border-gray-200 hover:border-[#6366F1]/30 hover:bg-gray-50"
                }`}
              >
                <div className={`p-3 rounded-full ${audienceType === "event" ? "bg-[#6366F1]" : "bg-gray-100"}`}>
                  <CalendarDays className={`h-6 w-6 ${audienceType === "event" ? "text-white" : "text-gray-500"}`} />
                </div>
                <div className="text-center">
                  <p className={`font-medium ${audienceType === "event" ? "text-[#6366F1]" : "text-[#1E1B4B]"}`}>
                    Event
                  </p>
                  <p className="text-sm text-gray-500">Link to event</p>
                </div>
                {audienceType === "event" && (
                  <Check className="h-5 w-5 text-[#6366F1]" />
                )}
              </button>
            </div>

            {/* Audience Summary */}
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-[#6366F1]" />
              <span className="text-[#1E1B4B]/60">Recipients:</span>
              <span className={`font-medium ${
                audienceType !== "all" && !isValid() ? "text-amber-600" : "text-[#1E1B4B]"
              }`}>
                {getAudienceSummary()}
              </span>
            </div>

            {/* Group Selector */}
            {audienceType === "groups" && (
              <div className="border border-[#6366F1]/20 rounded-lg overflow-hidden">
                {/* Selected Groups Chips */}
                {selectedGroups.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 border-b border-[#6366F1]/10 bg-[#6366F1]/5">
                    {selectedGroups.map((group) => (
                      <Badge
                        key={group._id}
                        variant="secondary"
                        className="flex items-center gap-1 px-2 py-1 bg-white"
                      >
                        <FolderOpen className="h-3 w-3 text-[#6366F1]" />
                        <span className="truncate max-w-[150px]">{group.name}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleGroup(group._id)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Search */}
                <div className="p-3 border-b border-[#6366F1]/10">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search groups..."
                      value={groupSearch}
                      onChange={(e) => setGroupSearch(e.target.value)}
                      className="pl-10 border-[#6366F1]/20"
                    />
                  </div>
                </div>

                {/* Header with Select All */}
                <div className="flex items-center gap-3 p-3 border-b border-[#6366F1]/10 bg-gray-50/50">
                  <Checkbox
                    checked={filteredGroups.length > 0 && filteredGroups.every((g) => selectedGroupIds.has(g._id))}
                    onCheckedChange={handleSelectAllGroups}
                    disabled={filteredGroups.length === 0}
                  />
                  <span className="text-sm font-medium text-[#1E1B4B]">
                    {filteredGroups.length > 0 && filteredGroups.every((g) => selectedGroupIds.has(g._id))
                      ? "Deselect All"
                      : "Select All"
                    }
                  </span>
                  <span className="text-sm text-[#1E1B4B]/60 ml-auto">
                    {filteredGroups.length} available
                  </span>
                </div>

                {/* Group List */}
                <div className="max-h-[250px] overflow-y-auto">
                  {groupsLoading ? (
                    <div className="p-4 space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                      ))}
                    </div>
                  ) : filteredGroups.length > 0 ? (
                    <div className="divide-y divide-[#6366F1]/10">
                      {filteredGroups.map((group) => (
                        <label
                          key={group._id}
                          className="flex items-center gap-3 p-3 hover:bg-[#6366F1]/5 cursor-pointer transition-colors"
                        >
                          <Checkbox
                            checked={selectedGroupIds.has(group._id)}
                            onCheckedChange={() => handleToggleGroup(group._id)}
                          />
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6366F1]/10">
                              <FolderOpen className="h-4 w-4 text-[#6366F1]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-[#1E1B4B] truncate">{group.name}</p>
                              <p className="text-sm text-[#1E1B4B]/60 truncate">{group.description || "No description"}</p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : groups && groups.length === 0 ? (
                    <div className="p-8 text-center">
                      <FolderOpen className="mx-auto h-12 w-12 text-[#6366F1]/30" />
                      <p className="mt-2 text-[#1E1B4B]/60">No groups available</p>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Search className="mx-auto h-12 w-12 text-[#6366F1]/30" />
                      <p className="mt-2 text-[#1E1B4B]/60">No groups match your search</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setGroupSearch("")}
                        className="mt-2 text-[#6366F1]"
                      >
                        Clear search
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Event Selector */}
            {audienceType === "event" && (
              <div className="border border-[#6366F1]/20 rounded-lg overflow-hidden">
                {/* Selected Event */}
                {selectedEvent && (
                  <div className="p-3 border-b border-[#6366F1]/10 bg-[#6366F1]/5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6366F1]">
                        <CalendarDays className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#1E1B4B] truncate">{selectedEvent.title}</p>
                        <p className="text-sm text-[#1E1B4B]/60">
                          {new Date(selectedEvent.startsAt).toLocaleDateString()} · {selectedEvent.location}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedEventId("")}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Search */}
                {!selectedEvent && (
                  <>
                    <div className="p-3 border-b border-[#6366F1]/10">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search events..."
                          value={eventSearch}
                          onChange={(e) => setEventSearch(e.target.value)}
                          className="pl-10 border-[#6366F1]/20"
                        />
                      </div>
                    </div>

                    {/* Event List */}
                    <div className="max-h-[250px] overflow-y-auto">
                      {eventsLoading ? (
                        <div className="p-4 space-y-3">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                          ))}
                        </div>
                      ) : filteredEvents.length > 0 ? (
                        <div className="divide-y divide-[#6366F1]/10">
                          {filteredEvents.map((event) => (
                            <button
                              key={event._id}
                              type="button"
                              onClick={() => setSelectedEventId(event._id)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-[#6366F1]/5 transition-colors text-left"
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6366F1]/10">
                                <CalendarDays className="h-4 w-4 text-[#6366F1]" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-[#1E1B4B] truncate">{event.title}</p>
                                <p className="text-sm text-[#1E1B4B]/60">
                                  {new Date(event.startsAt).toLocaleDateString()} · {event.location}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : events && events.length === 0 ? (
                        <div className="p-8 text-center">
                          <CalendarDays className="mx-auto h-12 w-12 text-[#6366F1]/30" />
                          <p className="mt-2 text-[#1E1B4B]/60">No events available</p>
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <Search className="mx-auto h-12 w-12 text-[#6366F1]/30" />
                          <p className="mt-2 text-[#1E1B4B]/60">No events match your search</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setEventSearch("")}
                            className="mt-2 text-[#6366F1]"
                          >
                            Clear search
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Push Notification Card */}
        <Card className="border-[#6366F1]/10">
          <CardContent className="p-6">
            <div
              onClick={() => setPushEnabled(!pushEnabled)}
              className="flex items-start space-x-3 cursor-pointer select-none"
            >
              <Checkbox
                id="push"
                checked={pushEnabled}
                onCheckedChange={() => {}}
                className="mt-0.5 pointer-events-none border-[#6366F1]/30 data-[state=checked]:bg-[#6366F1] data-[state=checked]:border-[#6366F1]"
              />
              <div className="space-y-1 pointer-events-none">
                <Label htmlFor="push" className="text-[#1E1B4B] cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-[#6366F1]" />
                    Enable Push Notifications
                  </div>
                </Label>
                <p className="text-sm text-[#1E1B4B]/60">
                  Send push notifications to members&apos; devices in addition to email.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={!isValid() || createMutation.isPending}
            className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Draft
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.navigate({ to: "/messages" })}
            className="border-[#6366F1]/20 text-[#1E1B4B]"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
