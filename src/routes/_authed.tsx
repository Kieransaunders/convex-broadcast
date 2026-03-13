import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ location, context }) => {
    // Token is already fetched in __root.tsx beforeLoad — reuse it
    const token = (context as any).token;
    if (!token)
      throw redirect({ to: "/sign-in", search: { redirect: location.href } });
  },
  component: () => <Outlet />,
});
