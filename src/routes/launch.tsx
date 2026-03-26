import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { clearTokenCache, getCachedAuth } from "~/lib/auth-helpers";
import { getLaunchDestination } from "~/lib/pwa-launch";

export const Route = createFileRoute("/launch")({
  head: () => ({
    meta: [
      {
        title: "Launching Org Comms",
      },
      {
        name: "robots",
        content: "noindex, nofollow",
      },
    ],
  }),
  component: LaunchPage,
});

function LaunchPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const resolveLaunch = async () => {
      try {
        const token = await getCachedAuth();

        if (cancelled) return;

        await router.navigate({
          to: getLaunchDestination(token),
          replace: true,
        });
      } catch {
        if (cancelled) return;

        clearTokenCache();
        await router.navigate({
          to: "/sign-in",
          replace: true,
        });
      }
    };

    void resolveLaunch();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F3FF] px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6366F1] text-2xl font-semibold text-white shadow-lg shadow-[#6366F1]/20">
          OC
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-[#1E1B4B]">Org Comms</h1>
          <p className="text-sm text-[#1E1B4B]/65">
            Preparing your inbox.
          </p>
        </div>
        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-[#6366F1]/12">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-[#6366F1]" />
        </div>
      </div>
    </main>
  );
}
