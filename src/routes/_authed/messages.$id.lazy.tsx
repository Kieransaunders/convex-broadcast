import { Link, createLazyFileRoute, useNavigate  } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useMutation } from "convex/react";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { MobileBottomNav } from "~/components/mobile-bottom-nav";
import { useAppBadge } from "~/hooks/use-app-badge";

export const Route = createLazyFileRoute("/_authed/messages/$id")({
  component: MessageDetailPage,
});

function MessageDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: message } = useQuery(
    convexQuery(api.messages.getById, { id: id as any }),
  );
  const { data: delivery } = useQuery(
    convexQuery(api.messages.getMyDelivery, { messageId: id as any }),
  );
  const { data: user } = useQuery(convexQuery(api.auth.getCurrentUser, {}));
  const { data: messages } = useQuery(convexQuery(api.messages.feed, {}));
  const markRead = useMutation(api.messages.markRead);
  const deleteMyDelivery = useMutation(api.messages.deleteMyDelivery);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const isAdmin = user && (user.role === "admin" || user.role === "super_admin");
  const unreadCount = messages?.filter((msg: any) => !msg.delivery?.readAt).length ?? 0;

  // Update PWA app icon badge
  useAppBadge(unreadCount);

  const handleDelete = async () => {
    if (!confirm("Delete this message from your inbox?")) return;
    setIsDeleting(true);
    try {
      await deleteMyDelivery({ messageId: id as any });
      navigate({ to: "/inbox" });
    } catch (err) {
      console.error("Failed to delete message:", err);
      setIsDeleting(false);
    }
  };

  // Auto-mark as read when viewing
  useEffect(() => {
    if (delivery && !delivery.readAt) {
      markRead({ deliveryId: delivery._id });
    }
  }, [delivery, markRead]);

  const categoryColors: Record<string, string> = {
    notice: "bg-blue-100 text-blue-800",
    reminder: "bg-yellow-100 text-yellow-800",
    event_update: "bg-purple-100 text-purple-800",
    urgent: "bg-red-100 text-red-800",
  };

  if (!message) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F5F3FF]">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <Link to="/inbox">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="ml-2 text-lg font-semibold text-[#1E1B4B]">Message</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-gray-500 hover:text-red-600 hover:bg-red-50"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Trash2 className="h-4 w-4 mr-1" />
            )}
            Delete
          </Button>
        </div>
      </header>
      <main className="container mx-auto max-w-2xl px-4 py-6 pb-24 sm:pb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-[#1E1B4B]">
                {message.title}
              </CardTitle>
              <Badge className={categoryColors[message.category] || ""}>
                {message.category}
              </Badge>
            </div>
            <p className="text-sm text-gray-400">
              {new Date(message.createdAt).toLocaleString()}
            </p>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-gray-700">{message.body}</p>
          </CardContent>
        </Card>
      </main>
      <MobileBottomNav isAdmin={!!isAdmin} unreadCount={unreadCount} />
    </div>
  );
}
