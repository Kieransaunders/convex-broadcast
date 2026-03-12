import { Bell, BellOff, Calendar, Clock, Loader2, Save, Send, Users } from "lucide-react"
import { format } from "date-fns"
import type { ComposeFormValues } from "./use-compose-form"
import type { UseFormReturn } from "react-hook-form"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { cn } from "~/lib/utils"

interface StepPreviewProps {
  form: UseFormReturn<ComposeFormValues>
  onSaveDraft: () => void
  onSendNow: () => void
  onSchedule: () => void
  isSubmitting: boolean
}

const categoryColors: Record<string, string> = {
  notice: "bg-blue-100 text-blue-800",
  reminder: "bg-yellow-100 text-yellow-800",
  event_update: "bg-purple-100 text-purple-800",
  urgent: "bg-red-100 text-red-800",
}

const categoryLabels: Record<string, string> = {
  notice: "Notice",
  reminder: "Reminder",
  event_update: "Event Update",
  urgent: "Urgent",
}

export function StepPreview({ form, onSaveDraft, onSendNow, onSchedule, isSubmitting }: StepPreviewProps) {
  const values = form.getValues()
  const { title, body, category, audienceType, selectedGroupIds, deliveryMode, scheduledDate, scheduledTime, pushEnabled } = values

  const audienceSummary = () => {
    if (audienceType === "all") return "All members"
    if (audienceType === "groups") return `${selectedGroupIds.length} group${selectedGroupIds.length === 1 ? "" : "s"}`
    return "Event attendees"
  }

  const scheduleDisplay = () => {
    if (deliveryMode === "now") return "Send immediately"
    if (scheduledDate && scheduledTime) {
      const [h, m] = scheduledTime.split(":").map(Number)
      const d = new Date(scheduledDate)
      d.setHours(h, m)
      return format(d, "PPP 'at' h:mm a")
    }
    return "Scheduled"
  }

  return (
    <div className="space-y-6">
      {/* Message preview — styled like member feed card */}
      <div>
        <p className="text-sm font-medium text-[#1E1B4B]/60 mb-3">Message preview (as members will see it)</p>
        <Card className={`transition-shadow border-l-4 border-l-[#6366F1]`}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#6366F1]" />
                <CardTitle className="text-base">{title || "Untitled message"}</CardTitle>
              </div>
              <Badge className={categoryColors[category] || "bg-gray-100 text-gray-800"}>
                {categoryLabels[category] || category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{body || "No content"}</p>
            <p className="mt-2 text-xs text-gray-400">{format(new Date(), "MMM d, yyyy")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Summary table */}
      <Card className="border-[#6366F1]/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-[#1E1B4B]">Delivery Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <dt className="flex items-center gap-2 text-[#1E1B4B]/60">
                <Users className="h-4 w-4 text-[#6366F1]" />
                Recipients
              </dt>
              <dd className="font-medium text-[#1E1B4B]">{audienceSummary()}</dd>
            </div>
            <div className="flex items-center justify-between text-sm">
              <dt className="flex items-center gap-2 text-[#1E1B4B]/60">
                <Calendar className="h-4 w-4 text-[#6366F1]" />
                Delivery
              </dt>
              <dd className="font-medium text-[#1E1B4B]">{scheduleDisplay()}</dd>
            </div>
            <div className="flex items-center justify-between text-sm">
              <dt className="flex items-center gap-2 text-[#1E1B4B]/60">
                {pushEnabled ? <Bell className="h-4 w-4 text-[#6366F1]" /> : <BellOff className="h-4 w-4 text-[#6366F1]" />}
                Push Notifications
              </dt>
              <dd className={cn("font-medium", pushEnabled ? "text-[#10B981]" : "text-gray-500")}>
                {pushEnabled ? "Enabled" : "Disabled"}
              </dd>
            </div>
            <div className="flex items-center justify-between text-sm">
              <dt className="flex items-center gap-2 text-[#1E1B4B]/60">Category</dt>
              <dd><Badge className={categoryColors[category] || ""}>{categoryLabels[category] || category}</Badge></dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onSaveDraft}
          disabled={isSubmitting}
          className="border-[#6366F1]/20 text-[#1E1B4B] cursor-pointer"
        >
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save as Draft
        </Button>

        {deliveryMode === "now" && (
          <Button
            type="button"
            onClick={onSendNow}
            disabled={isSubmitting}
            className="bg-[#10B981] hover:bg-[#10B981]/90 text-white cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send Now
          </Button>
        )}

        {deliveryMode === "schedule" && (
          <Button
            type="button"
            onClick={onSchedule}
            disabled={isSubmitting}
            className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock className="mr-2 h-4 w-4" />}
            Schedule Message
          </Button>
        )}
      </div>
    </div>
  )
}
