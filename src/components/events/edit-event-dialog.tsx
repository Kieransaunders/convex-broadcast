import { useState, useEffect } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useConvex } from "convex/react"
import { convexQuery } from "@convex-dev/react-query"
import { api } from "../../../convex/_generated/api.js"
import type { Id } from "../../../convex/_generated/dataModel.js"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Pencil } from "lucide-react"

interface EditEventDialogProps {
  eventId: Id<"events">
}

export function EditEventDialog({ eventId }: EditEventDialogProps) {
  const convex = useConvex()
  const [open, setOpen] = useState(false)
  const { data: event } = useQuery(convexQuery(api.events.getById, { id: eventId }))

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")
  const [status, setStatus] = useState<"scheduled" | "changed" | "cancelled" | "completed">("scheduled")

  useEffect(() => {
    if (event && open) {
      setTitle(event.title)
      setDescription(event.description)
      setLocation(event.location)
      setStartsAt(new Date(event.startsAt).toISOString().slice(0, 16))
      setEndsAt(new Date(event.endsAt).toISOString().slice(0, 16))
      setStatus(event.status)
    }
  }, [event, open])

  const updateEvent = useMutation({
    mutationFn: async (data: {
      id: Id<"events">
      title: string
      description: string
      location: string
      startsAt: number
      endsAt: number
      status: "scheduled" | "changed" | "cancelled" | "completed"
    }) => {
      return await convex.mutation(api.events.update, data)
    },
    onSuccess: () => setOpen(false),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !startsAt || !endsAt) return
    updateEvent.mutate({
      id: eventId,
      title,
      description,
      location,
      startsAt: new Date(startsAt).getTime(),
      endsAt: new Date(endsAt).getTime(),
      status,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="w-full bg-[#6366F1] hover:bg-[#6366F1]/90 text-white">
            <Pencil className="mr-2 h-4 w-4" />
            Edit Event
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-[#1E1B4B]">Edit Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Event Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter event description"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-location">Location</Label>
            <Input
              id="edit-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-startsAt">Start Date & Time</Label>
              <Input
                id="edit-startsAt"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-endsAt">End Date & Time</Label>
              <Input
                id="edit-endsAt"
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="changed">Changed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white"
              disabled={updateEvent.isPending}
            >
              {updateEvent.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
