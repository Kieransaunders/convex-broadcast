import { createFileRoute, redirect } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "../../../convex/_generated/api.js";

export const Route = createFileRoute("/_authed/_admin")({
  beforeLoad: async ({ context }) => {
    const { queryClient } = context as any;
    const user = await queryClient.fetchQuery(
      convexQuery(api.auth.getCurrentUser, {}),
    );
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      throw redirect({ to: "/inbox", search: { notice: "admin_only" } });
    }
    return { adminUser: user };
  },
});
