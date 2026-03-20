import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { getCachedAuth } from "~/lib/auth-helpers";

export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ location }) => {
    const token = await getCachedAuth();
    if (!token)
      throw redirect({ to: "/sign-in", search: { redirect: location.href } });
    return { token };
  },
  component: () => <Outlet />,
});
