import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { getCachedAuth, clearTokenCache } from "~/lib/auth-helpers";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "../../convex/_generated/api";
import { MobileBottomNav } from "~/components/mobile-bottom-nav";

export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ location }) => {
    const token = await getCachedAuth();
    if (!token)
      throw redirect({ 
        to: "/sign-in", 
        search: { redirect: location.pathname + location.search } 
      });
    return { token };
  },
  errorComponent: ({ error }) => {
    // Handle auth errors gracefully
    const handleSignOut = async () => {
      clearTokenCache();
      await authClient.signOut();
      window.location.href = "/sign-in";
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F3FF] p-4">
        <Card className="max-w-md w-full border-red-200">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold text-red-600 mb-2">
              Authentication Error
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {error instanceof Error ? error.message : "Your session has expired or is invalid."}
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                className="bg-[#6366F1] text-white hover:bg-[#6366F1]/90"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const { data: user } = useQuery(convexQuery(api.auth.getCurrentUser, {}));
  const { data: unreadCount } = useQuery(convexQuery(api.messages.unreadCount, {}));
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  return (
    <>
      <div className="pb-20 sm:pb-0">
        <Outlet />
      </div>
      <MobileBottomNav isAdmin={isAdmin} unreadCount={unreadCount ?? 0} />
    </>
  );
}
