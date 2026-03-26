import { Link, createLazyFileRoute  } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { ArrowLeft, Bell, CheckCircle2, Loader2, LogOut, Smartphone, User } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { clearTokenCache } from "~/lib/auth-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Switch } from "~/components/ui/switch";
import { authClient } from "~/lib/auth-client";
import { MobileBottomNav } from "~/components/mobile-bottom-nav";
import { useAppBadge } from "~/hooks/use-app-badge";
import { usePWAInstall } from "~/hooks/use-pwa-install";

export const Route = createLazyFileRoute("/_authed/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: user } = useQuery(convexQuery(api.auth.getCurrentUser, {}));
  const { data: subscription } = useQuery(
    convexQuery(api.push.getMySubscription, user ? {} : "skip"),
  );
  const { data: vapidKey } = useQuery(
    convexQuery(api.push.getVapidPublicKey, user ? {} : "skip"),
  );
  const updatePreference = useMutation(api.push.updatePreference);
  const subscribe = useMutation(api.push.subscribe);
  const unsubscribe = useMutation(api.push.unsubscribe);
  const sendTest = useMutation(api.push.sendTest);

  const isAdmin = user && (user.role === "admin" || user.role === "super_admin");
  const { data: messages } = useQuery(convexQuery(api.messages.feed, {}));
  const unreadCount = messages?.items.filter((msg: any) => !msg.delivery?.readAt).length ?? 0;

  // Update PWA app icon badge
  useAppBadge(unreadCount);

  const [pushEnabled, setPushEnabled] = useState(false);
  const [preference, setPreference] = useState<"all" | "urgent" | "none">(
    "all",
  );

  useEffect(() => {
    if (subscription) {
      setPushEnabled(true);
      setPreference(subscription.preference);
    }
  }, [subscription]);

  const { isInstallable, install } = usePWAInstall();
  const isStandalone =
    typeof window !== "undefined" &&
    window.matchMedia("(display-mode: standalone)").matches;

  const [pushLoading, setPushLoading] = useState(false);

  const handlePushToggle = async (enabled: boolean) => {
    setPushLoading(true);
    try {
      if (enabled) {
        // Request permission and subscribe
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          alert(
            "Notification permission denied. Please enable notifications in your browser settings.",
          );
          setPushEnabled(false);
          return;
        }

        const keyToUse = vapidKey || import.meta.env.VITE_VAPID_PUBLIC_KEY;
        if (!keyToUse) {
          console.error("VAPID public key not configured");
          alert(
            "Push notification system is still initializing. Please try again in 5 seconds.",
          );
          setPushEnabled(false);
          return;
        }

        // Register service worker and subscribe
        const registration = await navigator.serviceWorker.ready;
        const pushSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(keyToUse) as BufferSource,
        });

        await subscribe({
          endpoint: pushSubscription.endpoint,
          p256dh: arrayBufferToBase64(pushSubscription.getKey("p256dh")!),
          auth: arrayBufferToBase64(pushSubscription.getKey("auth")!),
          preference: "all",
        });
        setPushEnabled(true);
        // Invalidate push subscription status to update UI in inbox
        queryClient.invalidateQueries({ queryKey: ["push-subscription-status"] });
        alert("Push notifications enabled successfully!");
      } else {
        // Unsubscribe
        const registration = await navigator.serviceWorker.ready;
        const pushSubscription =
          await registration.pushManager.getSubscription();
        if (pushSubscription) {
          await unsubscribe({ endpoint: pushSubscription.endpoint });
          await pushSubscription.unsubscribe();
        }
        setPushEnabled(false);
        // Invalidate push subscription status to update UI in inbox
        queryClient.invalidateQueries({ queryKey: ["push-subscription-status"] });
        alert("Push notifications disabled.");
      }
    } catch (error) {
      console.error("Error toggling push notifications:", error);
      alert("Failed to update push notification settings. Please try again.");
      setPushEnabled(!enabled);
    } finally {
      setPushLoading(false);
    }
  };

  const handlePreferenceChange = async (value: "all" | "urgent" | "none") => {
    setPreference(value);
    await updatePreference({ preference: value });
  };

  const [testLoading, setTestLoading] = useState(false);

  const handleSendTest = async () => {
    setTestLoading(true);
    try {
      await sendTest({
        title: "Push is working!",
        body: "Your device is successfully registered for Org Comms broadcasts."
      });
      alert("Test notification sent! It should arrive in a few seconds.");
    } catch (error) {
      console.error("Failed to send test push:", error);
      alert("Failed to send test notification. Check console for details.");
    } finally {
      setTestLoading(false);
    }
  };

  const handleSignOut = async () => {
    clearTokenCache();
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF]">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link to="/inbox">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="ml-2 text-xl font-bold text-[#1E1B4B]">Settings</h1>
        </div>
      </header>
      <main className="container mx-auto max-w-xl px-4 py-6 pb-24 sm:pb-6">
        <div className="space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-500">Name</Label>
                <p className="text-lg font-medium">{user?.name}</p>
              </div>
              <div>
                <Label className="text-gray-500">Email</Label>
                <p className="text-lg font-medium">{user?.email}</p>
              </div>
              <div>
                <Label className="text-gray-500">Role</Label>
                <p className="text-lg font-medium capitalize">{user?.role}</p>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Push Notifications</Label>
                  <p className="text-sm text-gray-500">
                    {typeof window !== "undefined" &&
                    !("Notification" in window)
                      ? "Notifications are not supported in this browser."
                      : "Receive notifications in your browser"}
                  </p>
                </div>
                <Switch
                  checked={pushEnabled}
                  onCheckedChange={handlePushToggle}
                  disabled={
                    pushLoading ||
                    (typeof window !== "undefined" &&
                      !("Notification" in window))
                  }
                />
              </div>

              {pushEnabled && (
                <div className="space-y-3">
                  <Label>Notification Preference</Label>
                  <RadioGroup
                    value={preference}
                    onValueChange={(v) => handlePreferenceChange(v as any)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all">All messages</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="urgent" id="urgent" />
                      <Label htmlFor="urgent">Urgent only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="none" />
                      <Label htmlFor="none">None (in-app only)</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {pushEnabled && (
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-amber-200 text-amber-700 hover:bg-amber-50"
                    onClick={handleSendTest}
                    disabled={testLoading}
                  >
                    {testLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Bell className="mr-2 h-4 w-4" />
                    )}
                    Send Test Notification
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* App Install Section */}
          {(isInstallable || isStandalone) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  App
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isStandalone ? (
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">App installed</p>
                      <p className="text-sm text-gray-500">
                        You're using the installed app.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Install App</p>
                      <p className="text-sm text-gray-500">
                        Add to your home screen for the best experience.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#6366F1] text-white hover:bg-[#6366F1]/90"
                      onClick={install}
                    >
                      Install
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Sign Out */}
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </main>
      <MobileBottomNav isAdmin={!!isAdmin} unreadCount={unreadCount} />
    </div>
  );
}

// Helper functions
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
