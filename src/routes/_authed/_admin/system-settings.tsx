import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { Bell, ExternalLink, Info, Loader2, Mail, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useConvex } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api.js";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export const Route = createFileRoute("/_authed/_admin/system-settings")({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const convex = useConvex();
  const { data: settingsData, isLoading } = useQuery(
    convexQuery(api.settings.getSet, {
      keys: ["sender_email", "app_name", "resend_api_key_instruction"],
    }),
  );

  const settings = settingsData as Record<string, any> | undefined;

  const [senderEmail, setSenderEmail] = useState("");
  const [appName, setAppName] = useState("");

  useEffect(() => {
    if (settings) {
      setSenderEmail(settings.sender_email ?? "noreply@orgcomms.app");
      setAppName(settings.app_name ?? "Org Comms");
    }
  }, [settings]);

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      return await convex.mutation(api.settings.update, { key, value });
    },
  });

  const sendTest = useMutation({
    mutationFn: async (args: { title: string; body: string }) => {
      return await convex.mutation(api.push.sendTest, args);
    },
  });

  const [testLoading, setTestLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSetting.mutateAsync({
      key: "sender_email",
      value: senderEmail,
    });
    await updateSetting.mutateAsync({ key: "app_name", value: appName });
    toast.success("Settings saved.");
  };

  const handleSendTest = async () => {
    setTestLoading(true);
    try {
      await sendTest.mutateAsync({
        title: "Push is working!",
        body: "Admin test — your device is receiving Org Comms broadcasts.",
      });
      toast.success("Test notification sent — it should arrive in a few seconds.");
    } catch (error) {
      console.error("Failed to send test push:", error);
      toast.error("Failed to send test notification. Check console for details.");
    } finally {
      setTestLoading(false);
    }
  };

  if (isLoading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1E1B4B]">Settings</h1>
        <p className="text-[#1E1B4B]/60 mt-1">
          Configure global application settings and email delivery.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:grid-rows-[auto_auto]">
        <Card className="border-[#6366F1]/10 bg-white">
          <CardHeader>
            <CardTitle className="text-[#1E1B4B] flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#6366F1]" />
              Email Configuration
            </CardTitle>
            <CardDescription>
              Configure the sender address and organization name for all
              outgoing emails.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appName">Organization Name</Label>
                <Input
                  id="appName"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="e.g. Org Comms"
                  className="border-[#6366F1]/20 focus:border-[#6366F1]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderEmail">Sender Email Address</Label>
                <Input
                  id="senderEmail"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="e.g. noreply@yourdomain.com"
                  className="border-[#6366F1]/20 focus:border-[#6366F1]"
                />
                <p className="text-xs text-[#1E1B4B]/50">
                  Important: This email must be from a domain verified in your
                  Resend dashboard.
                </p>
              </div>
              <Button
                type="submit"
                className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white w-full"
                disabled={updateSetting.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {updateSetting.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-[#6366F1]/10 bg-white">
          <CardHeader>
            <CardTitle className="text-[#1E1B4B] flex items-center gap-2">
              <Info className="h-5 w-5 text-[#6366F1]" />
              Setup Instructions
            </CardTitle>
            <CardDescription>
              How to configure your custom domain for email delivery.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-[#1E1B4B]/70">
            <div className="rounded-lg bg-[#6366F1]/5 p-4 space-y-3">
              <h4 className="font-semibold text-[#1E1B4B]">
                Domain Verification
              </h4>
              <ol className="list-decimal pl-4 space-y-2">
                <li>
                  Go to the{" "}
                  <a
                    href="https://resend.com/domains"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#6366F1] hover:underline inline-flex items-center gap-1"
                  >
                    Resend Dashboard <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  Add your domain (e.g., <code>itimedit.com</code>)
                </li>
                <li>Add the provided DNS records to your domain registrar</li>
                <li>Wait for verification (usually takes a few minutes)</li>
              </ol>
            </div>

            <div className="rounded-lg bg-amber-50 p-4 space-y-3 border border-amber-100">
              <h4 className="font-semibold text-amber-900">
                Configuring the App
              </h4>
              <p>
                Once verified, enter an email from that domain (e.g.,{" "}
                <code>hello@itimedit.com</code>) in the form to the left.
              </p>
              <p className="text-xs text-amber-700">
                Note: Sending from unverified domains will cause delivery
                failures.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#6366F1]/10 bg-white">
          <CardHeader>
            <CardTitle className="text-[#1E1B4B] flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#6366F1]" />
              Push Notifications
            </CardTitle>
            <CardDescription>
              Send a test push notification to your own device to verify delivery is working.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full border-[#6366F1]/20 text-[#6366F1] hover:bg-[#6366F1]/5"
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
            <p className="mt-3 text-xs text-[#1E1B4B]/50">
              You must have push notifications enabled in your member settings to receive this test.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
