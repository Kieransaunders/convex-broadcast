import { Link, createLazyFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle,
  Clock,
  FileText,
  FolderOpen,
  Globe,
  Loader2,
  MessageSquare,
  Send,
  Trash2,
  Users,
} from "lucide-react";
import { useConvex } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../../convex/_generated/api.js";
import type { Id } from "../../../../../convex/_generated/dataModel.js";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

const CATEGORY_CONFIG = {
  urgent: {
    color: "bg-red-100 text-red-700 border-red-200",
    icon: AlertCircle,
    label: "Urgent",
  },
  event_update: {
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: CalendarDays,
    label: "Event Update",
  },
  reminder: {
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Clock,
    label: "Reminder",
  },
  notice: {
    color: "bg-green-100 text-green-700 border-green-200",
    icon: MessageSquare,
    label: "Notice",
  },
} as const;

const STATUS_CONFIG = {
  draft: {
    color: "bg-gray-100 text-gray-700 border-gray-200",
    icon: FileText,
    label: "Draft",
  },
  scheduled: {
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Clock,
    label: "Scheduled",
  },
  sent: {
    color: "bg-green-100 text-green-700 border-green-200",
    icon: Send,
    label: "Sent",
  },
  archived: {
    color: "bg-gray-100 text-gray-500 border-gray-200",
    icon: FolderOpen,
    label: "Archived",
  },
} as const;

const AUDIENCE_CONFIG = {
  all: {
    icon: Globe,
    label: "All Members",
    description: "Every active member will receive this message",
  },
  groups: {
    icon: FolderOpen,
    label: "Specific Groups",
    description: "Members of selected groups",
  },
  event: {
    icon: CalendarDays,
    label: "Event Attendees",
    description: "Linked to an event",
  },
} as const;

export const Route = createLazyFileRoute("/_authed/_admin/messages/detail")({
  component: MessageDetailPage,
});

function MessageDetailPage() {
  const { id } = useSearch({ from: "/_authed/_admin/messages/detail" }) as unknown as { id: string };
  const convex = useConvex();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: message, isLoading } = useQuery(
    convexQuery(api.messages.getById, { id: id as Id<"messages"> }),
  );
  const { data: deliveryStats } = useQuery({
    ...convexQuery(api.messages.getDeliveryStats, {
      messageId: id as Id<"messages">,
    }),
    enabled: message?.status === "sent",
  });
  const sendMutation = useMutation({
    mutationFn: async () => {
      return await convex.mutation(api.messages.sendNow, {
        id: id as Id<"messages">,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await convex.mutation(api.messages.deleteDraft, {
        id: id as Id<"messages">,
      });
    },
    onSuccess: () => {
      navigate({ to: "/messages" });
    },
    onError: (error) => {
      setConfirmDelete(false);
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <div className="h-12 w-64 bg-gray-100 rounded animate-pulse" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-96 bg-gray-100 rounded animate-pulse" />
          <div className="h-64 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <FileText className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-[#1E1B4B]">
          Message not found
        </h2>
        <p className="mt-2 text-[#1E1B4B]/60">
          The message you're looking for doesn't exist or has been deleted.
        </p>
        <Link to="/messages">
          <Button className="mt-6 bg-[#6366F1] hover:bg-[#6366F1]/90 text-white">
            Back to Messages
          </Button>
        </Link>
      </div>
    );
  }

  const category = CATEGORY_CONFIG[message.category];
  const status = STATUS_CONFIG[message.status];
  const audience = AUDIENCE_CONFIG[message.audienceType];
  const CategoryIcon = category.icon;
  const StatusIcon = status.icon;
  const AudienceIcon = audience.icon;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-[#1E1B4B] hover:bg-[#6366F1]/10"
          >
            <Link to="/messages">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1E1B4B]">
                {message.title}
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={`${status.color} capitalize`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
              <Badge
                variant="outline"
                className={`${category.color} capitalize`}
              >
                <CategoryIcon className="h-3 w-3 mr-1" />
                {category.label}
              </Badge>
              {message.pushEnabled && (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  <Bell className="h-3 w-3 mr-1" />
                  Push
                </Badge>
              )}
            </div>
          </div>
        </div>

        {message.status === "draft" && (
          <Button
            onClick={() => sendMutation.mutate()}
            disabled={sendMutation.isPending}
            className="bg-[#10B981] hover:bg-[#10B981]/90 text-white shrink-0"
          >
            {sendMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Now
              </>
            )}
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Message Body Card */}
          <Card className="border-[#6366F1]/10 overflow-hidden">
            <CardHeader className="bg-[#F5F3FF]/50 border-b border-[#6366F1]/10">
              <CardTitle className="text-lg text-[#1E1B4B] flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#6366F1]" />
                Message Content
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose prose-slate max-w-none">
                <p className="text-[#1E1B4B] whitespace-pre-wrap leading-relaxed">
                  {message.body}
                </p>
              </div>

              {(message.sentAt || message.scheduledFor) && (
                <>
                  <Separator className="my-6 bg-[#6366F1]/10" />
                  <div className="flex flex-wrap gap-6 text-sm">
                    {message.sentAt && (
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                          <Send className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-[#1E1B4B]/60">Sent</p>
                          <p className="font-medium text-[#1E1B4B]">
                            {new Date(message.sentAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                    {message.scheduledFor && (
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-[#1E1B4B]/60">Scheduled for</p>
                          <p className="font-medium text-[#1E1B4B]">
                            {new Date(message.scheduledFor).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Delivery Stats - Only shown for sent messages */}
          {message.status === "sent" && deliveryStats && (
            <Card className="border-[#6366F1]/10">
              <CardHeader className="bg-[#F5F3FF]/50 border-b border-[#6366F1]/10">
                <CardTitle className="text-lg text-[#1E1B4B] flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#6366F1]" />
                  Delivery Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    icon={Users}
                    label="Recipients"
                    value={deliveryStats.total}
                    color="text-[#6366F1]"
                    bgColor="bg-[#6366F1]/10"
                  />
                  <StatCard
                    icon={CheckCircle}
                    label="Read"
                    value={deliveryStats.read}
                    color="text-green-600"
                    bgColor="bg-green-100"
                    percent={
                      deliveryStats.total > 0
                        ? Math.round(
                            (deliveryStats.read / deliveryStats.total) * 100,
                          )
                        : 0
                    }
                  />
                  <StatCard
                    icon={Bell}
                    label="Push Sent"
                    value={deliveryStats.pushSent}
                    color="text-blue-600"
                    bgColor="bg-blue-100"
                  />
                  <StatCard
                    icon={Clock}
                    label="Push Pending"
                    value={deliveryStats.pushPending}
                    color="text-amber-600"
                    bgColor="bg-amber-100"
                  />
                </div>

                {/* Read Rate Progress Bar */}
                {deliveryStats.total > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-[#1E1B4B]/60">Read Rate</span>
                      <span className="font-medium text-[#1E1B4B]">
                        {Math.round(
                          (deliveryStats.read / deliveryStats.total) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#6366F1] rounded-full transition-all duration-500"
                        style={{
                          width: `${(deliveryStats.read / deliveryStats.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions Card */}
          <Card className="border-[#6366F1]/10">
            <CardHeader className="bg-[#F5F3FF]/50 border-b border-[#6366F1]/10">
              <CardTitle className="text-lg text-[#1E1B4B]">Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {message.status === "draft" && (
                <>
                  <Button className="w-full bg-[#6366F1] hover:bg-[#6366F1]/90 text-white justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Edit Message
                  </Button>
                  <Button
                    onClick={() => sendMutation.mutate()}
                    disabled={sendMutation.isPending}
                    className="w-full bg-[#10B981] hover:bg-[#10B981]/90 text-white justify-start"
                  >
                    {sendMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Now
                      </>
                    )}
                  </Button>
                </>
              )}

              {message.status === "scheduled" && (
                <Button
                  variant="outline"
                  className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 justify-start"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Reschedule
                </Button>
              )}

              {message.status === "draft" && (
                <Button
                  variant="outline"
                  onClick={() => setConfirmDelete(true)}
                  disabled={deleteMutation.isPending}
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 justify-start"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Draft
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Audience Card */}
          <Card className="border-[#6366F1]/10">
            <CardHeader className="bg-[#F5F3FF]/50 border-b border-[#6366F1]/10">
              <CardTitle className="text-lg text-[#1E1B4B]">Audience</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6366F1]/10">
                  <AudienceIcon className="h-5 w-5 text-[#6366F1]" />
                </div>
                <div>
                  <p className="font-medium text-[#1E1B4B]">{audience.label}</p>
                  <p className="text-sm text-[#1E1B4B]/60">
                    {audience.description}
                  </p>
                </div>
              </div>

              {message.targets.length > 0 && (
                <>
                  <Separator className="my-4 bg-[#6366F1]/10" />
                  <div>
                    <p className="text-sm font-medium text-[#1E1B4B] mb-2">
                      {message.audienceType === "groups"
                        ? "Selected Groups"
                        : "Linked Event"}
                    </p>
                    <div className="space-y-2">
                      {message.targets.map((target) => (
                        <div
                          key={target._id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 text-sm"
                        >
                          {message.audienceType === "groups" ? (
                            <FolderOpen className="h-4 w-4 text-[#6366F1]" />
                          ) : (
                            <CalendarDays className="h-4 w-4 text-[#6366F1]" />
                          )}
                          <span className="text-[#1E1B4B] truncate">
                            {target.targetId}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Message Info Card */}
          <Card className="border-[#6366F1]/10">
            <CardHeader className="bg-[#F5F3FF]/50 border-b border-[#6366F1]/10">
              <CardTitle className="text-lg text-[#1E1B4B]">Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#1E1B4B]/60">Category</span>
                <Badge
                  variant="outline"
                  className={`${category.color} capitalize`}
                >
                  {category.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#1E1B4B]/60">Push Notifications</span>
                <span
                  className={
                    message.pushEnabled ? "text-green-600" : "text-gray-500"
                  }
                >
                  {message.pushEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#1E1B4B]/60">Created</span>
                <span className="text-[#1E1B4B]">
                  {new Date(message._creationTime).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(false)}>
        <DialogContent>
          <DialogHeader>
            <div className="mb-1 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <DialogTitle>Delete Draft?</DialogTitle>
            </div>
            <DialogDescription>
              <strong className="text-[#1E1B4B]">{message.title}</strong>
              <br />
              This will permanently delete this draft. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(false)}
              disabled={deleteMutation.isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
  percent,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  bgColor: string;
  percent?: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gray-50 p-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${bgColor}`}
        >
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-[#1E1B4B]">{value}</p>
          <p className="text-xs text-[#1E1B4B]/60">{label}</p>
        </div>
      </div>
      {percent !== undefined && (
        <div className="mt-2 flex items-center gap-1">
          <span className={`text-xs font-medium ${color}`}>{percent}%</span>
          <span className="text-xs text-[#1E1B4B]/40">read rate</span>
        </div>
      )}
    </div>
  );
}
