import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "../../convex/_generated/api.js";
import { Button } from "~/components/ui/button";
import { ShieldAlert, LogOut } from "lucide-react";
import { authClient } from "~/lib/auth-client";
import { useRouter } from "@tanstack/react-router";
import type { Id } from "../../convex/_generated/dataModel.js";

export function ImpersonationBanner() {
  const router = useRouter();
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUserId, setImpersonatedUserId] = useState<string | null>(
    null,
  );

  // Check if we're in impersonation mode
  useEffect(() => {
    const checkImpersonation = async () => {
      const session = await authClient.getSession();
      // Better Auth sets impersonatedBy in the session when impersonating
      const user = session.data?.user as any;
      if (user?.impersonatedBy) {
        setIsImpersonating(true);
        setImpersonatedUserId(user.id);
      } else {
        setIsImpersonating(false);
        setImpersonatedUserId(null);
      }
    };
    checkImpersonation();
  }, [router.state.location.pathname]);

  const { data: impersonatedUser } = useQuery({
    ...convexQuery(api.users.getById, {
      id: (impersonatedUserId as Id<"users">) || undefined,
    }),
    enabled: !!impersonatedUserId && isImpersonating,
  });

  const handleStopImpersonating = async () => {
    await authClient.admin.stopImpersonating();
    router.invalidate();
    // Navigate back to admin dashboard
    router.navigate({ to: "/dashboard" });
  };

  if (!isImpersonating || !impersonatedUser) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-amber-500 text-white shadow-lg">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">
              Impersonating: {impersonatedUser.name}
            </span>
            <span className="hidden text-amber-100 sm:inline">
              ({impersonatedUser.email})
            </span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
              {impersonatedUser.role}
            </span>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleStopImpersonating}
          className="bg-white text-amber-600 hover:bg-amber-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Exit Impersonation
        </Button>
      </div>
    </div>
  );
}
