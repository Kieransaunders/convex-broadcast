import { createFileRoute } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "../../../convex/_generated/api";

export const Route = createFileRoute("/_authed/inbox")({
  validateSearch: (search: Record<string, unknown>): { notice?: string } => ({
    notice: search.notice as string | undefined,
  }),
  loader: ({ context }) => {
    // Fire feed fetch immediately — don't await so the route renders without blocking.
    // By the time the lazy component mounts, the query is already in-flight or complete.
    void (context as any).queryClient.prefetchQuery(
      convexQuery(api.messages.feed, {}),
    );
  },
});
