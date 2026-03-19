import { Link, getRouteApi, createLazyFileRoute } from "@tanstack/react-router";
import { clearTokenCache } from "~/routes/__root";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Bell, BellOff, CheckCheck, Inbox, Loader2, Mail, MailOpen, Settings, Trash2 } from "lucide-react";
import { useConvex } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { authClient } from "~/lib/auth-client";
import { MobileBottomNav } from "~/components/mobile-bottom-nav";
import { useAppBadge } from "~/hooks/use-app-badge";
import { usePushSubscription } from "~/hooks/use-push-subscription";
import { cn } from "~/lib/utils";

export const Route = createLazyFileRoute("/_authed/inbox")({
  component: InboxPage,
});

const routeApi = getRouteApi("/_authed/inbox");

type FilterType = "all" | "unread" | "read";

function InboxPage() {
  const queryClient = useQueryClient();
  const { notice } = routeApi.useSearch();
  const [filter, setFilter] = useState<FilterType>("all");
  
  // Check if push notifications are enabled in browser
  const { data: isPushSubscribed } = usePushSubscription();
  
  // Fetch all messages once — filter client-side to avoid extra Convex calls on tab switch
  const {
    data: messages,
    isLoading: messagesLoading,
    error: messagesError,
    refetch,
  } = useQuery(convexQuery(api.messages.feed, {}));

  const displayMessages = useMemo(() => {
    if (!messages) return [];
    if (filter === "unread") return messages.filter((m: any) => !m.delivery?.readAt);
    if (filter === "read") return messages.filter((m: any) => !!m.delivery?.readAt);
    return messages;
  }, [messages, filter]);
  
  const convex = useConvex();
  
  // User query can load in parallel - only needed for admin check
  const { data: user } = useQuery(convexQuery(api.auth.getCurrentUser, {}));
  const isAdmin =
    user && (user.role === "admin" || user.role === "super_admin");
  
  // Use TanStack Query's useMutation for proper cache invalidation
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      return await convex.mutation(api.messages.markAllAsRead, {});
    },
    onSuccess: () => {
      // Invalidate all inbox queries
      queryClient.invalidateQueries({ queryKey: ["messages", "feed"] });
    },
  });
  
  const deleteMyDelivery = useMutation({
    mutationFn: async (messageId: string) => {
      return await convex.mutation(api.messages.deleteMyDelivery, { messageId: messageId as any });
    },
    onSuccess: () => {
      // Invalidate all inbox queries
      queryClient.invalidateQueries({ queryKey: ["messages", "feed"] });
    },
  });
  
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const unreadCount = useMemo(
    () => messages?.filter((msg: any) => !msg.delivery?.readAt).length ?? 0,
    [messages],
  );

  // Update PWA app icon badge
  useAppBadge(unreadCount);

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Delete this message from your feed?")) return;
    setDeletingId(messageId);
    try {
      await deleteMyDelivery.mutateAsync(messageId);
    } catch (err) {
      console.error("Failed to delete message:", err);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (messagesError) {
      console.error("Inbox Query Error:", messagesError);
    }
  }, [messagesError]);

  if (messagesError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F3FF] p-4">
        <Card className="max-w-md w-full border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-red-800 mb-4">
              {messagesError instanceof Error
                ? messagesError.message
                : "Failed to load your messages."}
            </p>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => refetch()}
                className="bg-[#6366F1] text-white hover:bg-[#6366F1]/90"
              >
                Retry Loading Messages
              </Button>
              <Button
                onClick={() => {
                  clearTokenCache();
                  authClient.signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        window.location.href = "/sign-in";
                      },
                    },
                  });
                }}
                variant="outline"
                className="border-red-300 text-red-700"
              >
                Sign Out & Restart
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render the UI shell immediately - messages load in background
  // This improves perceived performance by showing the layout instantly
  return (
    <div className="min-h-screen bg-[#F5F3FF]">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-[#1E1B4B]">Messages</h1>
            {isAdmin && (
              <Link to="/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#6366F1] text-[#6366F1]"
                >
                  <span className="hidden sm:inline">Admin Dashboard</span>
                  <span className="sm:hidden">Admin</span>
                </Button>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isPushSubscribed && <NotificationStatus unreadCount={unreadCount} />}
            <Link to="/settings">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-[#1E1B4B]/60"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-6 pb-24 sm:pb-6">
        {notice === "admin_only" && (
          <Card className="mb-4 border-amber-200 bg-amber-50">
            <CardContent className="p-4 text-sm text-amber-900">
              Admin access is only available to admin or super admin accounts.
              You are signed in successfully, and this is your message inbox.
            </CardContent>
          </Card>
        )}
        <div className="mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1E1B4B]">
              Your Messages
            </h2>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="border-[#6366F1]/20 text-[#6366F1] hover:bg-[#6366F1]/10"
                onClick={async () => {
                  await markAllAsRead.mutateAsync();
                }}
                disabled={markAllAsRead.isPending}
              >
                {markAllAsRead.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCheck className="mr-2 h-4 w-4" />
                )}
                Mark all as read
              </Button>
            )}
          </div>
          
          {/* Filter tabs */}
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
            {[
              { key: "all" as const, label: "All", icon: Inbox },
              { key: "unread" as const, label: "Unread", icon: Mail },
              { key: "read" as const, label: "Read", icon: MailOpen },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer",
                  filter === key
                    ? "bg-white text-[#1E1B4B] shadow-sm"
                    : "text-[#1E1B4B]/50 hover:text-[#1E1B4B]/80"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {/* Skeleton loaders while messages are loading */}
          {messagesLoading ? (
            <>
              <MessageSkeleton />
              <MessageSkeleton />
              <MessageSkeleton />
            </>
          ) : displayMessages.length === 0 ? (
            <Card className="p-8 text-center">
              <Bell className="mx-auto mb-4 h-12 w-12 text-[#818CF8]" />
              <p className="text-gray-600">
                No messages yet. Check back later!
              </p>
            </Card>
          ) : (
            displayMessages.map((msg: any) => (
              <MessageCard 
                key={msg._id} 
                message={msg} 
                onDelete={() => handleDeleteMessage(msg._id)}
                isDeleting={deletingId === msg._id}
              />
            ))
          )}
        </div>
      </main>
      <MobileBottomNav isAdmin={!!isAdmin} unreadCount={unreadCount} />
    </div>
  );
}

function NotificationStatus({ unreadCount }: { unreadCount?: number }) {
  const hasUnread = (unreadCount ?? 0) > 0;

  return (
    <Link to="/settings">
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer select-none bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
        title="Go to Settings to enable notifications"
      >
        <div className="relative">
          <BellOff className="h-3 w-3" />
          {hasUnread && (
            <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
              {unreadCount! > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
        <span className="hidden sm:inline text-xs font-bold">Enable Alerts</span>
        <span className="sm:hidden text-xs font-bold">Alerts</span>
      </div>
    </Link>
  );
}

function MessageCard({ 
  message, 
  onDelete,
  isDeleting 
}: { 
  message: any; 
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const isUnread = !message.delivery?.readAt;
  const categoryColors: Record<string, string> = {
    notice: "bg-blue-100 text-blue-800",
    reminder: "bg-yellow-100 text-yellow-800",
    event_update: "bg-purple-100 text-purple-800",
    urgent: "bg-red-100 text-red-800",
  };

  return (
    <div className="relative group">
      <Link to="/messages/$id" params={{ id: message._id }}>
        <Card
          className={cn(
            "transition-shadow hover:shadow-md",
            isUnread ? "border-l-4 border-l-[#6366F1]" : ""
          )}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 pr-8">
                {isUnread && (
                  <span className="h-2 w-2 rounded-full bg-[#6366F1] flex-shrink-0" />
                )}
                <CardTitle className="text-base">{message.title}</CardTitle>
              </div>
              <Badge className={categoryColors[message.category] || ""}>
                {message.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="line-clamp-2 text-sm text-gray-600">{message.body}</p>
            <p className="mt-2 text-xs text-gray-400">
              {new Date(message.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </Link>
      {/* Delete button - positioned absolutely */}
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete();
        }}
        disabled={isDeleting}
        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600 hover:bg-red-50"
        title="Delete from my messages"
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

function MessageSkeleton() {
  return (
    <Card className="border-[#6366F1]/10">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            <Skeleton className="h-2 w-2 rounded-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-3" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  );
}

