import { Link, createLazyFileRoute, getRouteApi } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { Bell, BellOff, CheckCheck, Inbox, Loader2, Mail, MailOpen, Settings, Trash2 } from "lucide-react";
import { useConvex } from "convex/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { clearTokenCache } from "~/lib/auth-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";
import { MobileBottomNav } from "~/components/mobile-bottom-nav";
import { useAppBadge } from "~/hooks/use-app-badge";
import { usePushSubscription } from "~/hooks/use-push-subscription";
import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import { Search, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

export const Route = createLazyFileRoute("/_authed/inbox")({
  component: InboxPage,
});

const routeApi = getRouteApi("/_authed/inbox");

type FilterType = "all" | "unread" | "read";

function InboxPage() {
  const { notice } = routeApi.useSearch();
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Check if push notifications are enabled in browser
  const { data: isPushSubscribed } = usePushSubscription();
  
  const [loadedPages, setLoadedPages] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Fetch first page of messages
  const {
    data: feedData,
    isLoading: messagesLoading,
    error: messagesError,
    refetch,
  } = useQuery(convexQuery(api.messages.feed, {}));

  // Sync first page data into loadedPages state
  useEffect(() => {
    if (feedData && feedData.items) {
      setLoadedPages([feedData.items]);
      setNextCursor(feedData.cursor ?? null);
      setHasMore(feedData.hasMore ?? false);
    }
  }, [feedData]);

  const messages = useMemo(
    () => loadedPages.flat(),
    [loadedPages],
  );

  const displayMessages = useMemo(() => {
    if (!messages || !Array.isArray(messages)) return [];
    
    let filtered = messages;
    
    // Filter by read/unread status
    if (filter === "unread") filtered = messages.filter((m: any) => !m.delivery?.readAt);
    else if (filter === "read") filtered = messages.filter((m: any) => !!m.delivery?.readAt);
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((m: any) => 
        m.title.toLowerCase().includes(query) || 
        m.body.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [messages, filter, searchQuery]);
  
  const convex = useConvex();
  
  // User query can load in parallel - only needed for admin check
  const { data: user } = useQuery(convexQuery(api.auth.getCurrentUser, {}));
  const isAdmin =
    user && (user.role === "admin" || user.role === "super_admin");
  
  const queryClient = useQueryClient();


  // Use TanStack Query's useMutation with optimistic updates
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      return await convex.mutation(api.messages.markAllAsRead, {});
    },
    onMutate: async () => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: convexQuery(api.messages.feed, {}).queryKey });
      
      // Snapshot previous value
      const previousMessages = queryClient.getQueryData(convexQuery(api.messages.feed, {}).queryKey);
      
      // Optimistically update to mark all as read
      queryClient.setQueryData(convexQuery(api.messages.feed, {}).queryKey, (old: any) => {
        if (!old) return old;
        const items = old.items ?? old;
        const updated = (Array.isArray(items) ? items : []).map((msg: any) => ({
          ...msg,
          delivery: { ...msg.delivery, readAt: Date.now() }
        }));
        return old.items ? { ...old, items: updated } : updated;
      });
      
      return { previousMessages };
    },
    onError: (_err, _variables, context) => {
      // If offline, queue the action instead of just rolling back
      if (!navigator.onLine) {
        queueOfflineAction({ type: "markAllAsRead" });
        return; // Keep optimistic state
      }
      
      // Rollback on true error
      if (context?.previousMessages) {
        queryClient.setQueryData(convexQuery(api.messages.feed, {}).queryKey, context.previousMessages);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure cache is in sync
      queryClient.invalidateQueries({ queryKey: convexQuery(api.messages.feed, {}).queryKey });
      queryClient.invalidateQueries({ queryKey: convexQuery(api.messages.unreadCount, {}).queryKey });
    },
  });

  const deleteMyDelivery = useMutation({
    mutationFn: async (messageId: string) => {
      return await convex.mutation(api.messages.deleteMyDelivery, { messageId: messageId as any });
    },
    onMutate: async (messageId) => {
      await queryClient.cancelQueries({ queryKey: convexQuery(api.messages.feed, {}).queryKey });
      
      const previousMessages = queryClient.getQueryData(convexQuery(api.messages.feed, {}).queryKey);
      
      // Optimistically remove the message
      queryClient.setQueryData(convexQuery(api.messages.feed, {}).queryKey, (old: any) => {
        if (!old) return old;
        const items = old.items ?? old;
        const filtered = (Array.isArray(items) ? items : []).filter((msg: any) => msg._id !== messageId);
        return old.items ? { ...old, items: filtered } : filtered;
      });
      
      return { previousMessages };
    },
    onError: (_err, variables, context) => {
      if (!navigator.onLine) {
        queueOfflineAction({ type: "deleteMessage", id: variables });
        return;
      }

      if (context?.previousMessages) {
        queryClient.setQueryData(convexQuery(api.messages.feed, {}).queryKey, context.previousMessages);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: convexQuery(api.messages.feed, {}).queryKey });
      queryClient.invalidateQueries({ queryKey: convexQuery(api.messages.unreadCount, {}).queryKey });
    },
  });
  
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // --- Offline Sync Logic ---
  useEffect(() => {
    const syncOfflineActions = async () => {
      if (!navigator.onLine) return;
      
      const queue = JSON.parse(localStorage.getItem("offline_actions") || "[]");
      if (queue.length === 0) return;
      
      console.log(`Syncing ${queue.length} offline actions...`);
      const newQueue = [];
      
      for (const action of queue) {
        try {
          if (action.type === "markAllAsRead") {
            await convex.mutation(api.messages.markAllAsRead, {});
          } else if (action.type === "deleteMessage") {
            await convex.mutation(api.messages.deleteMyDelivery, { messageId: action.id });
          }
        } catch (e) {
          console.error("Failed to sync offline action", action, e);
          newQueue.push(action); // Keep failed actions in queue
        }
      }
      
      localStorage.setItem("offline_actions", JSON.stringify(newQueue));
      if (newQueue.length < queue.length) {
        queryClient.invalidateQueries({ queryKey: convexQuery(api.messages.feed, {}).queryKey });
      }
    };

    window.addEventListener("online", syncOfflineActions);
    syncOfflineActions(); // Check on mount
    
    return () => window.removeEventListener("online", syncOfflineActions);
  }, [convex, queryClient]);

  const queueOfflineAction = (action: any) => {
    const queue = JSON.parse(localStorage.getItem("offline_actions") || "[]");
    queue.push(action);
    localStorage.setItem("offline_actions", JSON.stringify(queue));
  };

  const unreadCount = useMemo(
    () => (Array.isArray(messages) ? messages : []).filter((msg: any) => !msg.delivery?.readAt).length ?? 0,
    [messages],
  );

  // Update PWA app icon badge
  useAppBadge(unreadCount);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (!confirm("Delete this message from your feed?")) return;
    setDeletingId(messageId);
    try {
      await deleteMyDelivery.mutateAsync(messageId);
    } catch (err) {
      console.error("Failed to delete message:", err);
    } finally {
      setDeletingId(null);
    }
  }, [deleteMyDelivery]);

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const result = await convex.query(api.messages.feed, { cursor: nextCursor });
      if (result && result.items) {
        setLoadedPages((prev) => [...prev, result.items]);
        setNextCursor(result.cursor ?? null);
        setHasMore(result.hasMore ?? false);
      }
    } catch (err) {
      console.error("Failed to load more messages:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, isLoadingMore, convex]);

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead.mutateAsync();
  }, [markAllAsRead]);

  const handleFilterChange = useCallback((key: FilterType) => {
    setFilter(key);
  }, []);

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
                onClick={handleMarkAllAsRead}
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
          
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 border-[#6366F1]/10 bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
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
                onClick={() => handleFilterChange(key)}
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
            <>
              {displayMessages.map((msg: any) => (
                <MessageCard
                  key={msg._id}
                  message={msg}
                  onDelete={() => handleDeleteMessage(msg._id)}
                  isDeleting={deletingId === msg._id}
                />
              ))}
              {hasMore && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="border-[#6366F1]/20 text-[#6366F1] hover:bg-[#6366F1]/10"
                  >
                    {isLoadingMore ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Load more messages
                  </Button>
                </div>
              )}
            </>
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
                  <span className={cn(
                    "h-2.5 w-2.5 rounded-full flex-shrink-0",
                    message.category === "urgent" 
                      ? "bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" 
                      : "bg-[#6366F1]"
                  )} />
                )}
                <CardTitle className="text-base">{message.title}</CardTitle>
              </div>
              <Badge className={categoryColors[message.category] || ""}>
                {message.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="line-clamp-2 text-sm text-gray-600 prose prose-sm prose-slate max-w-none">
              <ReactMarkdown>{message.body}</ReactMarkdown>
            </div>
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

