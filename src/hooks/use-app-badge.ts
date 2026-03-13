import { useEffect } from "react";

/**
 * Hook to manage the PWA app icon badge
 * Updates the badge count based on unread messages
 */
export function useAppBadge(unreadCount: number) {
  useEffect(() => {
    // Check if the Badging API is supported
    if ("setAppBadge" in navigator && "clearAppBadge" in navigator) {
      if (unreadCount > 0) {
        // Set badge with unread count
        navigator
          .setAppBadge(unreadCount)
          .catch((err) => console.error("Failed to set app badge:", err));
      } else {
        // Clear badge when no unread messages
        navigator
          .clearAppBadge()
          .catch((err) => console.error("Failed to clear app badge:", err));
      }
    }
  }, [unreadCount]);
}

/**
 * Helper to update badge from service worker
 * Called when push notifications arrive
 */
export async function updateAppBadgeFromWorker(count: number): Promise<void> {
  if ("setAppBadge" in navigator) {
    try {
      if (count > 0) {
        await navigator.setAppBadge(count);
      } else {
        await navigator.clearAppBadge();
      }
    } catch (err) {
      console.error("Failed to update badge from worker:", err);
    }
  }
}
