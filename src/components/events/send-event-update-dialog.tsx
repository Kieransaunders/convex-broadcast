import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useConvex } from "convex/react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, Send } from "lucide-react";
import { api } from "../../../convex/_generated/api.js";
import type { Id } from "../../../convex/_generated/dataModel.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

interface SendEventUpdateDialogProps {
  eventId: Id<"events">;
  eventTitle: string;
}

export function SendEventUpdateDialog({
  eventId,
  eventTitle,
}: SendEventUpdateDialogProps) {
  const convex = useConvex();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(`Update: ${eventTitle}`);
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<
    "notice" | "reminder" | "event_update" | "urgent"
  >("event_update");
  const [pushEnabled, setPushEnabled] = useState(true);

  const createMessage = useMutation({
    mutationFn: async (data: {
      title: string;
      body: string;
      category: "notice" | "reminder" | "event_update" | "urgent";
      audienceType: "all" | "groups" | "event";
      linkedEventId?: Id<"events">;
      pushEnabled: boolean;
    }) => {
      return await convex.mutation(api.messages.create, data);
    },
    onSuccess: (messageId) => {
      setOpen(false);
      // Navigate to the message detail to send/schedule
      navigate({ to: "/messages/$id", params: { id: messageId } });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;
    createMessage.mutate({
      title,
      body,
      category,
      audienceType: "event",
      linkedEventId: eventId,
      pushEnabled,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="w-full border-[#6366F1]/20 text-[#6366F1]"
          >
            <Send className="mr-2 h-4 w-4" />
            Send Update
          </Button>
        }
      />
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
                <Label htmlFor="cat-event" className="cursor-pointer">
                  Event Update
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reminder" id="cat-reminder" />
                <Label htmlFor="cat-reminder" className="cursor-pointer">
                  Reminder
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="notice" id="cat-notice" />
                <Label htmlFor="cat-notice" className="cursor-pointer">
                  Notice
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="urgent" id="cat-urgent" />
                <Label htmlFor="cat-urgent" className="cursor-pointer">
                  Urgent
                </Label>
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
            <Label
              htmlFor="push-enabled"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Bell className="h-4 w-4" />
              Send push notification
            </Label>
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
              disabled={createMessage.isPending}
            >
              {createMessage.isPending ? "Creating..." : "Create Message"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
