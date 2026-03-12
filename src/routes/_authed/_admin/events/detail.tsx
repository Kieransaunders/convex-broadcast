import { createFileRoute, useSearch, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { convexQuery } from "@convex-dev/react-query"
import { api } from "../../../../../convex/_generated/api.js"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Separator } from "~/components/ui/separator"
import { EditEventDialog } from "~/components/events/edit-event-dialog"
import { ArrowLeft, CalendarDays, MapPin, Clock, Calendar } from "lucide-react"
import type { Id } from "../../../../../convex/_generated/dataModel.js"

type SearchParams = {
  id: string
}

export const Route = createFileRoute("/_authed/_admin/events/detail")({
  component: EventDetailPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    id: search.id as string,
  }),
})

function EventDetailPage() {
  const { id } = useSearch({ from: "/_authed/_admin/events/detail" })

  const { data: event, isLoading } = useQuery(
    convexQuery(api.events.getById, { id: id as Id<"events"> })
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-700"
      case "changed":
        return "bg-yellow-100 text-yellow-700"
      case "cancelled":
        return "bg-red-100 text-red-700"
      case "completed":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
        <div className="h-64 bg-gray-100 rounded animate-pulse" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <CalendarDays className="mx-auto h-12 w-12 text-[#6366F1]/30" />
        <p className="mt-4 text-lg text-[#1E1B4B]">Event not found</p>
        <Button className="mt-4 bg-[#6366F1]">
          <Link to="/events">Back to Events</Link>
        </Button>
      </div>
    )
  }

  const startDate = new Date(event.startsAt)
  const endDate = new Date(event.endsAt)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-[#1E1B4B]">
          <Link to="/events">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-[#1E1B4B]">{event.title}</h1>
          <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-[#6366F1]/10 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-[#1E1B4B]">Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-[#1E1B4B]/60 mb-1">Description</h3>
              <p className="text-[#1E1B4B]">{event.description || "No description provided"}</p>
            </div>

            <Separator className="bg-[#6366F1]/10" />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6366F1]/10">
                  <Calendar className="h-5 w-5 text-[#6366F1]" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#1E1B4B]/60">Date</h3>
                  <p className="text-[#1E1B4B] font-medium">
                    {startDate.toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6366F1]/10">
                  <Clock className="h-5 w-5 text-[#6366F1]" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#1E1B4B]/60">Time</h3>
                  <p className="text-[#1E1B4B] font-medium">
                    {startDate.toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {endDate.toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {event.location && (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6366F1]/10">
                    <MapPin className="h-5 w-5 text-[#6366F1]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#1E1B4B]/60">Location</h3>
                    <p className="text-[#1E1B4B] font-medium">{event.location}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#6366F1]/10">
          <CardHeader>
            <CardTitle className="text-lg text-[#1E1B4B]">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <EditEventDialog eventId={id as Id<"events">} />
            <Button variant="outline" className="w-full border-[#6366F1]/20 text-[#6366F1]">
              Send Update
            </Button>
            {event.status !== "cancelled" && (
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50"
              >
                Cancel Event
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
