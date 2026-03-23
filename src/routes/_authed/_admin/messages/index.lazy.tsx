import {
  AlertTriangle,
  ArrowRight,
  Clock,
  FileText,
  Loader2,
  Mail,
  Plus,
  Send,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link, createLazyFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useConvex } from "convex/react";
import { api } from "../../../../../convex/_generated/api.js";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";
import ReactMarkdown from "react-markdown";

export const Route = createLazyFileRoute("/_authed/_admin/messages/")({
  component: MessagesPage,
});

type Message = {
  _id: string;
  title: string;
  body: string;
  category: string;
  status: string;
  pushEnabled: boolean;
  audienceType?: string;
  scheduledFor?: number;
  sentAt?: number;
};

type FilterTab = "drafts" | "scheduled" | "sent";

function MessagesPage() {
  const convex = useConvex();
  const {
    data: allMessages,
    isLoading,
    refetch,
  } = useQuery(convexQuery(api.messages.list, {}));

  const drafts = (allMessages?.filter((m) => m.status === "draft") ||
    []) as Array<Message>;
  const scheduled = (allMessages?.filter((m) => m.status === "scheduled") ||
    []) as Array<Message>;
  const sent = (allMessages?.filter(
    (m) => m.status === "sent" || m.status === "archived",
  ) || []) as Array<Message>;

  const [activeTab, setActiveTab] = useState<FilterTab>("drafts");

  const [confirmDialog, setConfirmDialog] = useState<{
    type: "send" | "delete" | "cancel" | "deleteSent";
    message: Message;
  } | null>(null);

  const sendMutation = useMutation({
    mutationFn: async (id: string) => {
      await convex.mutation(api.messages.sendNow, { id: id as any });
    },
    onSuccess: () => {
      refetch();
      setConfirmDialog(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await convex.mutation(api.messages.deleteDraft, { id: id as any });
    },
    onSuccess: () => {
      refetch();
      setConfirmDialog(null);
    },
  });

  const deleteSentMutation = useMutation({
    mutationFn: async (id: string) => {
      await convex.mutation(api.messages.deleteMessage, { id: id as any });
    },
    onSuccess: () => {
      refetch();
      setConfirmDialog(null);
    },
    onError: (error) => {
      alert("Only super admins can delete sent messages. " + error.message);
      setConfirmDialog(null);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await convex.mutation(api.messages.cancelScheduled, { id: id as any });
    },
    onSuccess: () => {
      refetch();
      setConfirmDialog(null);
    },
  });

  const isActionPending =
    sendMutation.isPending ||
    deleteMutation.isPending ||
    cancelMutation.isPending ||
    deleteSentMutation.isPending;

  const handleConfirm = () => {
    if (!confirmDialog) return;
    const { type, message } = confirmDialog;
    if (type === "send") sendMutation.mutate(message._id);
    if (type === "delete") deleteMutation.mutate(message._id);
    if (type === "cancel") cancelMutation.mutate(message._id);
    if (type === "deleteSent") deleteSentMutation.mutate(message._id);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "urgent":
        return "bg-red-100 text-red-700";
      case "event_update":
        return "bg-blue-100 text-blue-700";
      case "reminder":
        return "bg-yellow-100 text-yellow-700";
      case "notice":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "urgent":
        return "Urgent";
      case "event_update":
        return "Event Update";
      case "reminder":
        return "Reminder";
      case "notice":
        return "Notice";
      default:
        return category;
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const diff = timestamp - Date.now();
    const abs = Math.abs(diff);
    const minutes = Math.floor(abs / 60000);
    const hours = Math.floor(abs / 3600000);
    const days = Math.floor(abs / 86400000);
    const future = diff > 0;

    if (days > 0) return future ? `in ${days}d` : `${days}d ago`;
    if (hours > 0) return future ? `in ${hours}h` : `${hours}h ago`;
    return future ? `in ${minutes}m` : `${minutes}m ago`;
  };

  const MessageStats = ({ messageId }: { messageId: string }) => {
    const { data: stats, isLoading } = useQuery(
      convexQuery(api.messages.getDeliveryStats, { messageId: messageId as any }),
    );

    if (isLoading)
      return <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />;
    if (!stats || stats.total === 0) return null;

    const readPercentage = Math.round((stats.read / stats.total) * 100);

    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-[#1E1B4B]/60">Read Rate</span>
          <span className="font-bold text-[#1E1B4B]">
            {readPercentage}% ({stats.read}/{stats.total})
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={cn(
              "h-full transition-all duration-1000",
              readPercentage > 75
                ? "bg-green-500"
                : readPercentage > 30
                  ? "bg-[#6366F1]"
                  : "bg-gray-400",
            )}
            style={{ width: `${readPercentage}%` }}
          />
        </div>
      </div>
    );
  };

  const MessageCard = ({
    message,
    showDraftActions,
    showScheduledActions,
    showDeleteSent,
  }: {
    message: Message;
    showDraftActions?: boolean;
    showScheduledActions?: boolean;
    showDeleteSent?: boolean;
  }) => (
    <Link to="/messages/detail" search={{ id: message._id }}>
      <Card className="border-[#6366F1]/10 transition-shadow hover:shadow-md cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="truncate font-semibold text-[#1E1B4B]">
                  {message.title}
                </h3>
              </div>
              <div className="line-clamp-2 text-sm text-[#1E1B4B]/60 prose prose-sm prose-slate max-w-none">
                <ReactMarkdown>{message.body}</ReactMarkdown>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge className={getCategoryColor(message.category)}>
                  {getCategoryLabel(message.category)}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    message.pushEnabled
                      ? "border-green-200 text-green-700"
                      : "border-gray-200 text-gray-500"
                  }
                >
                  {message.pushEnabled ? "Push on" : "No push"}
                </Badge>
                {message.audienceType && (
                  <Badge
                    variant="outline"
                    className="border-[#6366F1]/20 text-[#6366F1]"
                  >
                    To: {message.audienceType}
                  </Badge>
                )}
                {message.scheduledFor && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 border-amber-200 text-amber-700"
                  >
                    <Clock className="h-3 w-3" />
                    {new Date(message.scheduledFor).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    <span className="text-xs opacity-70">
                      ({formatRelativeTime(message.scheduledFor)})
                    </span>
                  </Badge>
                )}
                {message.sentAt && (
                  <div className="mt-4 pt-4 border-t border-gray-50 w-full">
                    <MessageStats messageId={message._id} />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {showDraftActions && (
                <>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setConfirmDialog({ type: "send", message });
                    }}
                    className="cursor-pointer bg-[#10B981] text-white hover:bg-[#10B981]/90"
                  >
                    <Send className="mr-1 h-3 w-3" />
                    Send
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setConfirmDialog({ type: "delete", message });
                    }}
                    className="cursor-pointer border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
              {showScheduledActions && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setConfirmDialog({ type: "cancel", message });
                  }}
                  className="cursor-pointer border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  Cancel
                </Button>
              )}
              {!showDraftActions && !showScheduledActions && (
                <>
                  <ArrowRight className="h-5 w-5 text-[#6366F1]/40" />
                  {showDeleteSent && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setConfirmDialog({ type: "deleteSent", message });
                      }}
                      className="ml-2 cursor-pointer border-red-200 text-red-600 hover:bg-red-50"
                      title="Delete for all users (Super Admin only)"
                    >
                      <ShieldAlert className="h-3 w-3" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const EmptyState = ({ text }: { text: string }) => (
    <Card className="border-[#6366F1]/10">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Mail className="h-12 w-12 text-[#6366F1]/30" />
        <p className="mt-4 text-lg font-medium text-[#1E1B4B]">{text}</p>
      </CardContent>
    </Card>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="border-[#6366F1]/10">
          <CardContent className="p-6">
            <div className="mb-2 h-6 w-1/3 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const dialogConfig = {
    send: {
      title: "Send Message Now?",
      description:
        "This will immediately send the message to all targeted recipients. This action cannot be undone.",
      icon: Send,
      buttonLabel: "Send Now",
      buttonClass: "bg-[#10B981] hover:bg-[#10B981]/90 text-white",
    },
    delete: {
      title: "Delete Draft?",
      description:
        "This will permanently delete this draft. This action cannot be undone.",
      icon: Trash2,
      buttonLabel: "Delete",
      buttonClass: "bg-red-600 hover:bg-red-700 text-white",
    },
    cancel: {
      title: "Cancel Scheduled Message?",
      description:
        "This will cancel the scheduled send and move the message back to drafts.",
      icon: AlertTriangle,
      buttonLabel: "Cancel Schedule",
      buttonClass: "bg-amber-600 hover:bg-amber-700 text-white",
    },
    deleteSent: {
      title: "Delete Message for All Users?",
      description:
        "This will permanently delete this message for ALL users. This action cannot be undone and requires super admin privileges.",
      icon: ShieldAlert,
      buttonLabel: "Delete for All",
      buttonClass: "bg-red-600 hover:bg-red-700 text-white",
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1E1B4B]">Messages</h1>
          <p className="mt-1 text-[#1E1B4B]/60">
            Create and manage messages to your organisation.
          </p>
        </div>
        <Link to="/messages/new">
          <Button className="cursor-pointer bg-[#6366F1] text-white hover:bg-[#6366F1]/90">
            <Plus className="mr-2 h-4 w-4" />
            New Message
          </Button>
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
        {(
          [
            {
              key: "drafts" as const,
              label: "Drafts",
              icon: FileText,
              count: drafts.length,
            },
            {
              key: "scheduled" as const,
              label: "Scheduled",
              icon: Clock,
              count: scheduled.length,
            },
            {
              key: "sent" as const,
              label: "Sent",
              icon: Send,
              count: sent.length,
            },
          ] as const
        ).map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={cn(
              "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150",
              activeTab === key
                ? "bg-white text-[#1E1B4B] shadow-sm"
                : "text-[#1E1B4B]/50 hover:text-[#1E1B4B]/80",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
            {count > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs font-semibold leading-none tabular-nums",
                  activeTab === key
                    ? "bg-[#6366F1] text-white"
                    : "bg-[#1E1B4B]/10 text-[#1E1B4B]/60",
                )}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {isLoading ? (
          <LoadingSkeleton />
        ) : activeTab === "drafts" ? (
          drafts.length === 0 ? (
            <EmptyState text="No draft messages" />
          ) : (
            drafts.map((m) => (
              <MessageCard key={m._id} message={m} showDraftActions />
            ))
          )
        ) : activeTab === "scheduled" ? (
          scheduled.length === 0 ? (
            <EmptyState text="No scheduled messages" />
          ) : (
            scheduled.map((m) => (
              <MessageCard key={m._id} message={m} showScheduledActions />
            ))
          )
        ) : sent.length === 0 ? (
          <EmptyState text="No sent messages yet" />
        ) : (
          sent.map((m) => <MessageCard key={m._id} message={m} />)
        )}
      </div>

      {/* Confirmation dialog */}
      <Dialog
        open={!!confirmDialog}
        onOpenChange={(open) => !open && setConfirmDialog(null)}
      >
        <DialogContent>
          {confirmDialog &&
            (() => {
              const config = dialogConfig[confirmDialog.type];
              const Icon = config.icon;
              return (
                <>
                  <DialogHeader>
                    <div className="mb-1 flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg",
                          confirmDialog.type === "send"
                            ? "bg-[#10B981]/10"
                            : confirmDialog.type === "delete"
                              ? "bg-red-100"
                              : "bg-amber-100",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5",
                            confirmDialog.type === "send"
                              ? "text-[#10B981]"
                              : confirmDialog.type === "delete"
                                ? "text-red-600"
                                : "text-amber-600",
                          )}
                        />
                      </div>
                      <DialogTitle>{config.title}</DialogTitle>
                    </div>
                    <DialogDescription>
                      <strong className="text-[#1E1B4B]">
                        {confirmDialog.message.title}
                      </strong>
                      <br />
                      {config.description}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setConfirmDialog(null)}
                      disabled={isActionPending}
                      className="cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirm}
                      disabled={isActionPending}
                      className={cn(config.buttonClass, "cursor-pointer")}
                    >
                      {isActionPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Icon className="mr-2 h-4 w-4" />
                      )}
                      {config.buttonLabel}
                    </Button>
                  </DialogFooter>
                </>
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
