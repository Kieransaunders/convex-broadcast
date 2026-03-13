import {
  createFileRoute,
  Outlet,
  Link,
  useRouter,
} from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "../../../convex/_generated/api.js";
import { useEffect } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarFooter,
} from "~/components/ui/sidebar";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  CalendarDays,
  Mail,
  LogOut,
  ChevronDown,
  Settings,
} from "lucide-react";
import { authClient } from "~/lib/auth-client";
import { MobileBottomNav } from "~/components/mobile-bottom-nav";
import { useAppBadge } from "~/hooks/use-app-badge";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/users", icon: Users },
  { name: "Groups", href: "/groups", icon: FolderOpen },
  { name: "Events", href: "/events", icon: CalendarDays },
  { name: "Messages", href: "/messages", icon: Mail },
  { name: "Settings", href: "/system-settings", icon: Settings },
];

export const Route = createFileRoute("/_authed/_admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const router = useRouter();
  const { data: user, isLoading } = useQuery(
    convexQuery(api.auth.getCurrentUser, {}),
  );
  const { data: settings } = useQuery(
    convexQuery(api.settings.getSet, { keys: ["app_name"] }),
  );
  const { data: messages } = useQuery(
    convexQuery(api.messages.feed, {}),
  );
  const appName = (settings as any)?.app_name || "Org Comms";

  const isAdmin = Boolean(
    user && (user.role === "admin" || user.role === "super_admin"),
  );
  const unreadCount = messages?.filter((msg: any) => !msg.delivery?.readAt).length ?? 0;

  // Update PWA app icon badge
  useAppBadge(unreadCount);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.navigate({ to: "/feed", search: { notice: "admin_only" } });
    }
  }, [isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F5F3FF]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6366F1] border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F3FF] p-4">
        <div className="w-full max-w-md rounded-xl border border-amber-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-[#1E1B4B]">
            Admin access required
          </h1>
          <p className="mt-2 text-sm text-[#1E1B4B]/70">
            You are signed in, but this area is only available to admin and
            super admin accounts.
          </p>
          <p className="mt-1 text-sm text-[#1E1B4B]/70">
            Redirecting you to your feed now.
          </p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await authClient.signOut();
    router.invalidate();
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#F5F3FF]">
        <Sidebar className="border-r border-[#6366F1]/10 bg-white">
          <SidebarHeader className="border-b border-[#6366F1]/10 p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366F1]">
                <Mail className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-[#1E1B4B]">
                {appName}
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    render={
                      <Link
                        to={item.href}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#1E1B4B] hover:bg-[#6366F1]/10 [&.active]:bg-[#6366F1] [&.active]:text-white"
                        activeOptions={{ exact: item.href === "/dashboard" }}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-[#6366F1]/10 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-[#6366F1]/10">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[#6366F1] text-white text-xs">
                        {user?.name?.slice(0, 2).toUpperCase() || "AD"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-[#1E1B4B] truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-[#1E1B4B]/60 capitalize">
                        {user?.role}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-[#1E1B4B]/60" />
                  </button>
                }
              />
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <main className="flex-1 overflow-auto p-6 pb-24 sm:pb-6">
          <Outlet />
        </main>
        <MobileBottomNav isAdmin={true} unreadCount={unreadCount} />
      </div>
    </SidebarProvider>
  );
}
