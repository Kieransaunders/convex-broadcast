# Events Section Enhancement Implementation Plan

> **Goal:** Complete the Events section with full CRUD, group linking, and message integration.

**Architecture:** Schema changes first, then backend functions, then UI components.

**Tech Stack:** React 19, TanStack Start, Convex, shadcn/ui, Tailwind v4

---

## Task 1: Add Event-Group Link Schema

**Files:**
- Modify: `convex/schema.ts`

**Step 1: Add `eventGroupLinks` table to schema**

Add this table definition to `convex/schema.ts`:

```typescript
eventGroupLinks: defineTable({
  eventId: v.id("events"),
  groupId: v.id("groups"),
  createdAt: v.number(),
})
  .index("by_eventId", ["eventId"])
  .index("by_groupId", ["groupId"])
  .index("by_eventId_groupId", ["eventId", "groupId"]),
```

**Step 2: Verify schema compiles**

```bash
npx convex dev --once
```

**Step 3: Commit**

```bash
git add convex/schema.ts
git commit -m "feat(schema): add event-group link table for event targeting"
```

---

## Task 2: Add Event CRUD Mutations

**Files:**
- Modify: `convex/events.ts`

**Step 1: Add `remove` mutation**

Add to `convex/events.ts`:

```typescript
export const remove = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    await getAdminUser(ctx)
    // Delete associated links first
    const links = await ctx.db
      .query("eventGroupLinks")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.id))
      .collect()
    for (const link of links) {
      await ctx.db.delete(link._id)
    }
    await ctx.db.delete(args.id)
  },
})
```

**Step 2: Add `changeStatus` mutation**

Add to `convex/events.ts`:

```typescript
export const changeStatus = mutation({
  args: {
    id: v.id("events"),
    status: v.union(
      v.literal("scheduled"),
      v.literal("changed"),
      v.literal("cancelled"),
      v.literal("completed"),
    ),
  },
  handler: async (ctx, args) => {
    await getAdminUser(ctx)
    await ctx.db.patch(args.id, { status: args.status })
  },
})
```

**Step 3: Verify**

```bash
npx convex dev --once
```

**Step 4: Commit**

```bash
git add convex/events.ts
git commit -m "feat(events): add remove and changeStatus mutations"
```

---

## Task 3: Add Event-Group Linking Functions

**Files:**
- Modify: `convex/events.ts`

**Step 1: Add `getGroups` query**

Add to `convex/events.ts`:

```typescript
export const getGroups = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    await getUser(ctx)
    const links = await ctx.db
      .query("eventGroupLinks")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect()
    const groups = await Promise.all(
      links.map(async (link) => {
        const group = await ctx.db.get(link.groupId)
        return group ? { ...group, linkId: link._id } : null
      }),
    )
    return groups.filter(Boolean)
  },
})
```

**Step 2: Add `linkGroup` mutation**

Add to `convex/events.ts`:

```typescript
export const linkGroup = mutation({
  args: {
    eventId: v.id("events"),
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    await getAdminUser(ctx)
    // Check if already linked
    const existing = await ctx.db
      .query("eventGroupLinks")
      .withIndex("by_eventId_groupId", (q) =>
        q.eq("eventId", args.eventId).eq("groupId", args.groupId),
      )
      .unique()
    if (existing) return existing._id
    return await ctx.db.insert("eventGroupLinks", {
      eventId: args.eventId,
      groupId: args.groupId,
      createdAt: Date.now(),
    })
  },
})
```

**Step 3: Add `unlinkGroup` mutation**

Add to `convex/events.ts`:

```typescript
export const unlinkGroup = mutation({
  args: { linkId: v.id("eventGroupLinks") },
  handler: async (ctx, args) => {
    await getAdminUser(ctx)
    await ctx.db.delete(args.linkId)
  },
})
```

**Step 4: Add `getByGroup` query**

Add to `convex/events.ts`:

```typescript
export const getByGroup = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    await getUser(ctx)
    const links = await ctx.db
      .query("eventGroupLinks")
      .withIndex("by_groupId", (q) => q.eq("groupId", args.groupId))
      .collect()
    const events = await Promise.all(
      links.map(async (link) => await ctx.db.get(link.eventId)),
    )
    return events.filter(Boolean)
  },
})
```

**Step 5: Verify**

```bash
npx convex dev --once
```

**Step 6: Commit**

```bash
git add convex/events.ts
git commit -m "feat(events): add event-group linking functions"
```

---

## Task 4: Add Create Event Dialog Component

**Files:**
- Create: `src/components/events/create-event-dialog.tsx`
- Modify: `src/routes/_authed/_admin/events/index.tsx`

**Step 1: Create dialog component**

Create `src/components/events/create-event-dialog.tsx`:

```typescript
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useConvexMutation } from "@convex-dev/react-query"
import { api } from "../../../../convex/_generated/api.js"
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
import { CalendarDays } from "lucide-react"

interface CreateEventDialogProps {
  children?: React.ReactNode
}

export function CreateEventDialog({ children }: CreateEventDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")

  const createEvent = useMutation(
    useConvexMutation(api.events.create, {
      onSuccess: () => {
        setOpen(false)
        setTitle("")
        setDescription("")
        setLocation("")
        setStartsAt("")
        setEndsAt("")
      },
    })
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !startsAt || !endsAt) return
    createEvent.mutate({
      title,
      description,
      location,
      startsAt: new Date(startsAt).getTime(),
      endsAt: new Date(endsAt).getTime(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white">
            <CalendarDays className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-[#1E1B4B]">Create New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter event description"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startsAt">Start Date & Time</Label>
              <Input
                id="startsAt"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endsAt">End Date & Time</Label>
              <Input
                id="endsAt"
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                required
              />
            </div>
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
              disabled={createEvent.isPending}
            >
              {createEvent.isPending ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 2: Update events list page**

Modify `src/routes/_authed/_admin/events/index.tsx`:
- Import the dialog
- Wrap the Create Event button with the dialog

**Step 3: Verify**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/components/events/create-event-dialog.tsx src/routes/_authed/_admin/events/index.tsx
git commit -m "feat(events): add create event dialog component"
```

---

## Task 5: Add Edit Event Dialog Component

**Files:**
- Create: `src/components/events/edit-event-dialog.tsx`
- Modify: `src/routes/_authed/_admin/events/detail.tsx`

**Step 1: Create dialog component**

Create `src/components/events/edit-event-dialog.tsx`:

```typescript
import { useState, useEffect } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useConvexMutation, convexQuery } from "@convex-dev/react-query"
import { api } from "../../../../convex/_generated/api.js"
import type { Id } from "../../../../convex/_generated/dataModel.js"
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

interface EditEventDialogProps {
  eventId: Id<"events">
  children?: React.ReactNode
}

export function EditEventDialog({ eventId, children }: EditEventDialogProps) {
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

  const updateEvent = useMutation(
    useConvexMutation(api.events.update, {
      onSuccess: () => setOpen(false),
    })
  )

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
      <DialogTrigger asChild>{children}</DialogTrigger>
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
```

**Step 2: Update event detail page**

Modify `src/routes/_authed/_admin/events/detail.tsx`:
- Import the dialog
- Wrap the Edit Event button

**Step 3: Verify**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/components/events/edit-event-dialog.tsx src/routes/_authed/_admin/events/detail.tsx
git commit -m "feat(events): add edit event dialog component"
```

---

## Task 6: Connect Cancel Event Action

**Files:**
- Modify: `src/routes/_authed/_admin/events/detail.tsx`
- Create: `src/components/events/cancel-event-dialog.tsx`

**Step 1: Create cancel confirmation dialog**

Create `src/components/events/cancel-event-dialog.tsx`:

```typescript
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useConvexMutation } from "@convex-dev/react-query"
import { api } from "../../../../convex/_generated/api.js"
import type { Id } from "../../../../convex/_generated/dataModel.js"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface CancelEventDialogProps {
  eventId: Id<"events">
  eventTitle: string
  children?: React.ReactNode
}

export function CancelEventDialog({ eventId, eventTitle, children }: CancelEventDialogProps) {
  const [open, setOpen] = useState(false)

  const cancelEvent = useMutation(
    useConvexMutation(api.events.changeStatus, {
      onSuccess: () => setOpen(false),
    })
  )

  const handleCancel = () => {
    cancelEvent.mutate({ id: eventId, status: "cancelled" })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Cancel Event
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel <strong>{eventTitle}</strong>? This will update the event status to cancelled.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Keep Event
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={cancelEvent.isPending}
          >
            {cancelEvent.isPending ? "Cancelling..." : "Cancel Event"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 2: Update event detail page**

Modify `src/routes/_authed/_admin/events/detail.tsx`:
- Import the cancel dialog
- Replace the Cancel Event button with the dialog

**Step 3: Verify**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/components/events/cancel-event-dialog.tsx src/routes/_authed/_admin/events/detail.tsx
git commit -m "feat(events): add cancel event confirmation dialog"
```

---

## Task 7: Connect Send Update Button

**Files:**
- Create: `src/components/events/send-event-update-dialog.tsx`
- Modify: `src/routes/_authed/_admin/events/detail.tsx`

**Step 1: Create send update dialog**

Create `src/components/events/send-event-update-dialog.tsx`:

```typescript
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useConvexMutation } from "@convex-dev/react-query"
import { api } from "../../../../convex/_generated/api.js"
import type { Id } from "../../../../convex/_generated/dataModel.js"
import { useNavigate } from "@tanstack/react-router"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Send, Bell } from "lucide-react"

interface SendEventUpdateDialogProps {
  eventId: Id<"events">
  eventTitle: string
  children?: React.ReactNode
}

export function SendEventUpdateDialog({ eventId, eventTitle, children }: SendEventUpdateDialogProps) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const [title, setTitle] = useState(`Update: ${eventTitle}`)
  const [body, setBody] = useState("")
  const [category, setCategory] = useState<"notice" | "reminder" | "event_update" | "urgent">("event_update")
  const [pushEnabled, setPushEnabled] = useState(true)

  const createMessage = useMutation(
    useConvexMutation(api.messages.create, {
      onSuccess: (messageId) => {
        setOpen(false)
        // Navigate to the message detail to send/schedule
        navigate({ to: "/messages/$id", params: { id: messageId } })
      },
    })
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !body) return
    createMessage.mutate({
      title,
      body,
      category,
      audienceType: "event",
      linkedEventId: eventId,
      pushEnabled,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-[#1E1B4B] flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Event Update
          </DialogTitle>
          <DialogDescription>
            Create a message linked to <strong>{eventTitle}</strong>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="msg-title">Message Title</Label>
            <Input
              id="msg-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter message title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="msg-body">Message Body</Label>
            <Textarea
              id="msg-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter the update message"
              rows={4}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <RadioGroup
              value={category}
              onValueChange={(v) => setCategory(v as typeof category)}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="event_update" id="cat-event" />
                <Label htmlFor="cat-event" className="cursor-pointer">Event Update</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reminder" id="cat-reminder" />
                <Label htmlFor="cat-reminder" className="cursor-pointer">Reminder</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="notice" id="cat-notice" />
                <Label htmlFor="cat-notice" className="cursor-pointer">Notice</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="urgent" id="cat-urgent" />
                <Label htmlFor="cat-urgent" className="cursor-pointer">Urgent</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="push-enabled"
              checked={pushEnabled}
              onChange={(e) => setPushEnabled(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="push-enabled" className="flex items-center gap-2 cursor-pointer">
              <Bell className="h-4 w-4" />
              Send push notification
            </Label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white"
              disabled={createMessage.isPending}
            >
              {createMessage.isPending ? "Creating..." : "Create Message"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 2: Update event detail page**

Modify `src/routes/_authed/_admin/events/detail.tsx`:
- Import the send update dialog
- Replace the Send Update button with the dialog

**Step 3: Verify**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/components/events/send-event-update-dialog.tsx src/routes/_authed/_admin/events/detail.tsx
git commit -m "feat(events): add send event update dialog"
```

---

## Task 8: Update Events List with Group Filters

**Files:**
- Modify: `src/routes/_authed/_admin/events/index.tsx`

**Step 1: Add group filter UI**

Modify `src/routes/_authed/_admin/events/index.tsx`:
- Import Select component for group filtering
- Add state for selected group filter
- Filter events by linked group

**Step 2: Verify**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/routes/_authed/_admin/events/index.tsx
git commit -m "feat(events): add group filter to events list"
```

---

## Task 9: Test and Verify

**Step 1: Run type check**

```bash
npm run dev:ts
```

**Step 2: Build for production**

```bash
npm run build
```

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat(events): complete events section with full CRUD and message integration"
```

---

## Summary

| Task | Files | Deliverable |
|------|-------|-------------|
| 1 | `convex/schema.ts` | Event-group link schema |
| 2 | `convex/events.ts` | Remove, changeStatus mutations |
| 3 | `convex/events.ts` | Event-group linking queries/mutations |
| 4 | `src/components/events/create-event-dialog.tsx` | Create event dialog |
| 5 | `src/components/events/edit-event-dialog.tsx` | Edit event dialog |
| 6 | `src/components/events/cancel-event-dialog.tsx` | Cancel event dialog |
| 7 | `src/components/events/send-event-update-dialog.tsx` | Send update dialog |
| 8 | `src/routes/_authed/_admin/events/index.tsx` | Group filters |
| 9 | All | Verified build |

**Total: 9 tasks to complete Events section.**
