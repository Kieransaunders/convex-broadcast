import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { convexQuery } from "@convex-dev/react-query"
import { CalendarDays, Check, FolderOpen, Globe, Search, Users, X } from "lucide-react"
import { api } from "../../../convex/_generated/api.js"
import type { ComposeFormValues } from "./use-compose-form"
import type { UseFormReturn } from "react-hook-form"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Form, FormField, FormItem, FormMessage } from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { cn } from "~/lib/utils"

interface StepAudienceProps {
  form: UseFormReturn<ComposeFormValues>
}

export function StepAudience({ form }: StepAudienceProps) {
  const audienceType = form.watch("audienceType")
  const selectedGroupIds = form.watch("selectedGroupIds")
  const selectedEventId = form.watch("selectedEventId")
  const [groupSearch, setGroupSearch] = useState("")
  const [eventSearch, setEventSearch] = useState("")

  const { data: groups, isLoading: groupsLoading } = useQuery(convexQuery(api.groups.list, {}))
  const { data: events, isLoading: eventsLoading } = useQuery(convexQuery(api.events.list, {}))

  const filteredGroups = useMemo(() => {
    if (!groups) return []
    if (!groupSearch.trim()) return groups
    const q = groupSearch.toLowerCase()
    return groups.filter(g => g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q))
  }, [groups, groupSearch])

  const filteredEvents = useMemo(() => {
    if (!events) return []
    if (!eventSearch.trim()) return events
    const q = eventSearch.toLowerCase()
    return events.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.location.toLowerCase().includes(q))
  }, [events, eventSearch])

  const selectedGroups = useMemo(() => groups?.filter(g => selectedGroupIds.includes(g._id)) || [], [groups, selectedGroupIds])
  const selectedEvent = useMemo(() => events?.find(e => e._id === selectedEventId), [events, selectedEventId])

  const handleToggleGroup = (groupId: string) => {
    const current = form.getValues("selectedGroupIds")
    if (current.includes(groupId)) {
      form.setValue("selectedGroupIds", current.filter(id => id !== groupId), { shouldValidate: true })
    } else {
      form.setValue("selectedGroupIds", [...current, groupId], { shouldValidate: true })
    }
  }

  const handleSelectAllGroups = () => {
    const current = form.getValues("selectedGroupIds")
    const allSelected = filteredGroups.every(g => current.includes(g._id))
    if (allSelected) {
      form.setValue("selectedGroupIds", current.filter(id => !filteredGroups.find(g => g._id === id)), { shouldValidate: true })
    } else {
      const newIds = [...new Set([...current, ...filteredGroups.map(g => g._id)])]
      form.setValue("selectedGroupIds", newIds, { shouldValidate: true })
    }
  }

  const audienceCards = [
    { type: "all" as const, icon: Globe, label: "All Members", description: "Send to everyone" },
    { type: "groups" as const, icon: FolderOpen, label: "Groups", description: "Select groups" },
    { type: "event" as const, icon: CalendarDays, label: "Event", description: "Link to event" },
  ]

  return (
    <Form {...form}>
      <div className="space-y-6">
        {/* Audience Type Cards */}
        <FormField
          control={form.control}
          name="audienceType"
          render={({ field }) => (
            <FormItem>
              <div className="grid gap-4 sm:grid-cols-3">
                {audienceCards.map(({ type, icon: Icon, label, description }) => {
                  const isSelected = field.value === type
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => field.onChange(type)}
                      className={cn(
                        "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left",
                        isSelected
                          ? "border-[#6366F1] bg-[#6366F1]/5"
                          : "border-gray-200 hover:border-[#6366F1]/30 hover:bg-gray-50"
                      )}
                    >
                      <div className={cn("p-3 rounded-full", isSelected ? "bg-[#6366F1]" : "bg-gray-100")}>
                        <Icon className={cn("h-6 w-6", isSelected ? "text-white" : "text-gray-500")} />
                      </div>
                      <div className="text-center">
                        <p className={cn("font-medium", isSelected ? "text-[#6366F1]" : "text-[#1E1B4B]")}>{label}</p>
                        <p className="text-sm text-gray-500">{description}</p>
                      </div>
                      {isSelected && <Check className="h-5 w-5 text-[#6366F1]" />}
                    </button>
                  )
                })}
              </div>
            </FormItem>
          )}
        />

        {/* Audience summary */}
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-[#6366F1]" />
          <span className="text-[#1E1B4B]/60">Recipients:</span>
          <span className="font-medium text-[#1E1B4B]">
            {audienceType === "all" && "All members"}
            {audienceType === "groups" && (selectedGroupIds.length === 0 ? "Select at least one group" : `${selectedGroupIds.length} group${selectedGroupIds.length === 1 ? "" : "s"} selected`)}
            {audienceType === "event" && (selectedEventId ? selectedEvent?.title || "Selected event" : "Select an event")}
          </span>
        </div>

        {/* Group selector */}
        {audienceType === "groups" && (
          <FormField
            control={form.control}
            name="selectedGroupIds"
            render={() => (
              <FormItem>
                <div className="border border-[#6366F1]/20 rounded-lg overflow-hidden">
                  {selectedGroups.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 border-b border-[#6366F1]/10 bg-[#6366F1]/5">
                      {selectedGroups.map(group => (
                        <Badge key={group._id} variant="secondary" className="flex items-center gap-1 px-2 py-1 bg-white">
                          <FolderOpen className="h-3 w-3 text-[#6366F1]" />
                          <span className="truncate max-w-[150px]">{group.name}</span>
                          <button type="button" onClick={() => handleToggleGroup(group._id)} className="ml-1 hover:text-red-500 cursor-pointer">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="p-3 border-b border-[#6366F1]/10">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input placeholder="Search groups..." value={groupSearch} onChange={e => setGroupSearch(e.target.value)} className="pl-10 border-[#6366F1]/20" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border-b border-[#6366F1]/10 bg-gray-50/50">
                    <Checkbox
                      checked={filteredGroups.length > 0 && filteredGroups.every(g => selectedGroupIds.includes(g._id))}
                      onCheckedChange={handleSelectAllGroups}
                      disabled={filteredGroups.length === 0}
                    />
                    <span className="text-sm font-medium text-[#1E1B4B]">
                      {filteredGroups.length > 0 && filteredGroups.every(g => selectedGroupIds.includes(g._id)) ? "Deselect All" : "Select All"}
                    </span>
                    <span className="text-sm text-[#1E1B4B]/60 ml-auto">{filteredGroups.length} available</span>
                  </div>
                  <div className="max-h-[250px] overflow-y-auto">
                    {groupsLoading ? (
                      <div className="p-4 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
                    ) : filteredGroups.length > 0 ? (
                      <div className="divide-y divide-[#6366F1]/10">
                        {filteredGroups.map(group => (
                          <label key={group._id} className="flex items-center gap-3 p-3 hover:bg-[#6366F1]/5 cursor-pointer transition-colors">
                            <Checkbox checked={selectedGroupIds.includes(group._id)} onCheckedChange={() => handleToggleGroup(group._id)} />
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
                    ) : (
                      <div className="p-8 text-center">
                        <Search className="mx-auto h-12 w-12 text-[#6366F1]/30" />
                        <p className="mt-2 text-[#1E1B4B]/60">{groups && groups.length === 0 ? "No groups available" : "No groups match your search"}</p>
                        {groupSearch && <Button type="button" variant="ghost" size="sm" onClick={() => setGroupSearch("")} className="mt-2 text-[#6366F1]">Clear search</Button>}
                      </div>
                    )}
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Event selector */}
        {audienceType === "event" && (
          <FormField
            control={form.control}
            name="selectedEventId"
            render={({ field }) => (
              <FormItem>
                <div className="border border-[#6366F1]/20 rounded-lg overflow-hidden">
                  {selectedEvent ? (
                    <div className="p-3 bg-[#6366F1]/5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6366F1]">
                          <CalendarDays className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#1E1B4B] truncate">{selectedEvent.title}</p>
                          <p className="text-sm text-[#1E1B4B]/60">{new Date(selectedEvent.startsAt).toLocaleDateString()} · {selectedEvent.location}</p>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => field.onChange("")} className="text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 border-b border-[#6366F1]/10">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input placeholder="Search events..." value={eventSearch} onChange={e => setEventSearch(e.target.value)} className="pl-10 border-[#6366F1]/20" />
                        </div>
                      </div>
                      <div className="max-h-[250px] overflow-y-auto">
                        {eventsLoading ? (
                          <div className="p-4 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
                        ) : filteredEvents.length > 0 ? (
                          <div className="divide-y divide-[#6366F1]/10">
                            {filteredEvents.map(event => (
                              <button key={event._id} type="button" onClick={() => field.onChange(event._id)} className="w-full flex items-center gap-3 p-3 hover:bg-[#6366F1]/5 transition-colors text-left cursor-pointer">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6366F1]/10">
                                  <CalendarDays className="h-4 w-4 text-[#6366F1]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-[#1E1B4B] truncate">{event.title}</p>
                                  <p className="text-sm text-[#1E1B4B]/60">{new Date(event.startsAt).toLocaleDateString()} · {event.location}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 text-center">
                            <CalendarDays className="mx-auto h-12 w-12 text-[#6366F1]/30" />
                            <p className="mt-2 text-[#1E1B4B]/60">{events && events.length === 0 ? "No events available" : "No events match your search"}</p>
                            {eventSearch && <Button type="button" variant="ghost" size="sm" onClick={() => setEventSearch("")} className="mt-2 text-[#6366F1]">Clear search</Button>}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </Form>
  )
}
