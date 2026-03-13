import { createFileRoute, Link, getRouteApi } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMutation as useConvexMutation } from "convex/react";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { Settings, Bell, BellOff, Loader2, CheckCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { authClient } from "~/lib/auth-client";
import { MobileBottomNav } from "~/components/mobile-bottom-nav";

export const Route = createFileRoute("/_authed/feed")({
  component: FeedPage,
});

const routeApi = getRouteApi("/_authed/feed");

function FeedPage() {
  const search = routeApi.useSearch();
  const notice = (search as { notice?: string }).notice;
  // Fetch feed immediately - don't wait for user query
  // The feed query handles authentication internally via getUser(ctx)
  const {
    data: messages,
    isLoading: messagesLoading,
    error: messagesError,
  } = useQuery(convexQuery(api.messages.feed, {}));
  
  // User query can load in parallel - only needed for admin check
  const { data: user } = useQuery(convexQuery(api.auth.getCurrentUser, {}));
  const isAdmin =
    user && (user.role === "admin" || user.role === "super_admin");
  const markAllAsRead = useConvexMutation(api.messages.markAllAsRead);
  const [markingAll, setMarkingAll] = useState(false);

  // Calculate unread count
  const unreadCount = messages?.filter((msg: any) => !msg.delivery?.readAt).length ?? 0;

  // Update PWA app badge
  useEffect(() => {
    if ("setAppBadge" in navigator && unreadCount > 0) {
      navigator.setAppBadge(unreadCount);
    } else if ("clearAppBadge" in navigator) {
      navigator.clearAppBadge();
    }
  }, [unreadCount]);

  useEffect(() => {
    if (messagesError) {
      console.error("Feed Query Error:", messagesError);
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
                : "Failed to load your feed."}
            </p>
            <Button
              onClick={() => {
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
          </CardContent>
        </Card>
      </div>
    );
  }

  if (messagesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F3FF]">
        <Loader2 className="h-8 w-8 animate-spin text-[#6366F1]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF]">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-[#1E1B4B]">Org Comms</h1>
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
            <NotificationStatus userId={user?._id} unreadCount={unreadCount} />
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
              You are signed in successfully, and this is your member feed.
            </CardContent>
          </Card>
        )}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1E1B4B]">
            Your Messages
          </h2>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="border-[#6366F1]/20 text-[#6366F1] hover:bg-[#6366F1]/10"
              onClick={async () => {
                setMarkingAll(true);
                try {
                  await markAllAsRead();
                } finally {
                  setMarkingAll(false);
                }
              }}
              disabled={markingAll}
            >
              {markingAll ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="mr-2 h-4 w-4" />
              )}
              Mark all as read
            </Button>
          )}
        </div>
        <div className="space-y-4">
          {messages?.length === 0 && (
            <Card className="p-8 text-center">
              <Bell className="mx-auto mb-4 h-12 w-12 text-[#818CF8]" />
              <p className="text-gray-600">
                No messages yet. Check back later!
              </p>
            </Card>
          )}
          {messages?.map((msg: any) => (
            <MessageCard key={msg._id} message={msg} />
          ))}
        </div>
      </main>
      <MobileBottomNav isAdmin={!!isAdmin} unreadCount={unreadCount} />
    </div>
  );
}

function NotificationStatus({ userId, unreadCount }: { userId?: string; unreadCount?: number }) {
  const { data: subscription, isLoading } = useQuery(
    convexQuery(api.push.getMySubscription, userId ? {} : "skip"),
  );
  const { data: vapidKey } = useQuery(
    convexQuery(api.push.getVapidPublicKey, {}),
  );
  const subscribe = useConvexMutation(api.push.subscribe);
  const unsubscribe = useConvexMutation(api.push.unsubscribe);
  const isEnabled = !!subscription;
  const hasUnread = (unreadCount ?? 0) > 0;

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const key = vapidKey || import.meta.env.VITE_VAPID_PUBLIC_KEY;
          if (!key) {
            alert(
              "Notification system not ready. Please try again in a moment.",
            );
            return;
          }

          const registration = await navigator.serviceWorker.ready;
          const pushSubscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
          });

          await subscribe({
            endpoint: pushSubscription.endpoint,
            p256dh: arrayBufferToBase64(pushSubscription.getKey("p256dh")!),
            auth: arrayBufferToBase64(pushSubscription.getKey("auth")!),
            preference: "all",
          });
        }
      } catch (err) {
        console.error("Failed to enable notifications", err);
        alert("Failed to enable notifications. Is your browser blocking them?");
      }
    } else {
      try {
        const registration = await navigator.serviceWorker.ready;
        const pushSubscription =
          await registration.pushManager.getSubscription();
        if (pushSubscription) {
          await unsubscribe({ endpoint: pushSubscription.endpoint });
          await pushSubscription.unsubscribe();
        }
      } catch (err) {
        console.error("Failed to disable notifications", err);
      }
    }
  };

  if (isLoading)
    return <div className="h-9 w-24 animate-pulse rounded-full bg-gray-200" />;

  return (
    <div
      onClick={() => handleToggle(!isEnabled)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer select-none ${
        isEnabled
          ? "bg-green-50 border-green-200 text-green-700"
          : "bg-amber-50 border-amber-200 text-amber-700 animate-pulse outline outline-2 outline-amber-400/20"
      }`}
    >
      <Checkbox
        id="push-toggle-header"
        checked={isEnabled}
        onCheckedChange={() => {}} // Controlled by parent div click
        className={`pointer-events-none ${isEnabled ? "border-green-400" : "border-amber-400"}`}
      />
      <Label
        htmlFor="push-toggle-header"
        className="flex items-center gap-1.5 text-xs font-bold pointer-events-none"
      >
        {isEnabled ? (
          <div className="relative">
            <Bell className="h-3 w-3" />
            {hasUnread && (
              <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                {unreadCount! > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
        ) : (
          <BellOff className="h-3 w-3" />
        )}
        <span className="hidden sm:inline">
          {isEnabled ? "Alerts ON" : "Enable Alerts"}
        </span>
        <span className="sm:hidden">{isEnabled ? "ON" : "OFF"}</span>
      </Label>
    </div>
  );
}

function MessageCard({ message }: { message: any }) {
  const isUnread = !message.delivery?.readAt;
  const categoryColors: Record<string, string> = {
    notice: "bg-blue-100 text-blue-800",
    reminder: "bg-yellow-100 text-yellow-800",
    event_update: "bg-purple-100 text-purple-800",
    urgent: "bg-red-100 text-red-800",
  };

  return (
    <Link to="/messages/$id" params={{ id: message._id }}>
      <Card
        className={`transition-shadow hover:shadow-md ${isUnread ? "border-l-4 border-l-[#6366F1]" : ""}`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {isUnread && (
                <span className="h-2 w-2 rounded-full bg-[#6366F1]" />
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
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
