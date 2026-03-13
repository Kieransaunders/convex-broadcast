import { useQuery } from "@tanstack/react-query";

/**
 * Hook to check if the user has an active push subscription in the browser.
 * Uses TanStack Query to cache the result and avoid expensive re-checks.
 */
export function usePushSubscription() {
  return useQuery({
    queryKey: ["push-subscription-status"],
    queryFn: async () => {
      if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
        return false;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        return !!subscription;
      } catch (err) {
        console.error("Error checking push subscription:", err);
        return false;
      }
    },
    // This check is relatively stable, so we can keep it cached for a long time
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}
