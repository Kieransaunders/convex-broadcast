import { createFileRoute, redirect, Outlet } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

const getAuthToken = createServerFn({ method: "GET" }).handler(async () => {
  const { getToken } = await import("~/lib/auth-server")
  return await getToken()
})

export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ location }) => {
    const token = await getAuthToken()
    if (!token) throw redirect({ to: "/sign-in", search: { redirect: location.href } })
  },
  component: () => <Outlet />
})
