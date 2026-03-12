import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useConvex } from "convex/react"
import { api } from "../../../convex/_generated/api.js"
import type { Id } from "../../../convex/_generated/dataModel.js"
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
}

export function CancelEventDialog({ eventId, eventTitle }: CancelEventDialogProps) {
  const convex = useConvex()
  const [open, setOpen] = useState(false)

  const cancelEvent = useMutation({
    mutationFn: async () => {
      return await convex.mutation(api.events.changeStatus, { id: eventId, status: "cancelled" })
    },
    onSuccess: () => setOpen(false),
  })

  const handleCancel = () => {
    cancelEvent.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="w-full border-red-200 text-red-600 hover:bg-red-50"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Cancel Event
          </Button>
        }
      />
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
