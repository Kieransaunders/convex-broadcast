import { useQuery } from "@tanstack/react-query";
import {
  Link,
  Outlet,
  createLazyFileRoute,
  useRouter,
} from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import {
  CalendarDays,
  ChevronDown,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "~/components/ui/sidebar";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { MobileBottomNav } from "~/components/mobile-bottom-nav";
import { useAppBadge } from "~/hooks/use-app-badge";
import { authClient } from "~/lib/auth-client";
import { clearTokenCache } from "~/routes/__root";
import { api } from "../../../convex/_generated/api.js";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/users", icon: Users },
  { name: "Groups", href: "/groups", icon: FolderOpen },
  { name: "Events", href: "/events", icon: CalendarDays },
  { name: "Messages", href: "/messages", icon: Mail },
  { name: "Settings", href: "/system-settings", icon: Settings },
];

export const Route = createLazyFileRoute("/_authed/_admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const router = useRouter();
  const { adminUser } = Route.useRouteContext();
  const { data: user = adminUser } = useQuery(
    convexQuery(api.auth.getCurrentUser, {}),
  );
  const { data: settings } = useQuery(
    convexQuery(api.settings.getSet, { keys: ["app_name"] }),
  );
  const { data: unreadCount = 0 } = useQuery(
    convexQuery(api.messages.unreadCount, {}),
  );
  const appName = (settings as any)?.app_name || "Org Comms";

  useAppBadge(unreadCount);

  const handleSignOut = async () => {
    clearTokenCache();
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
                      <p className="truncate text-sm font-medium text-[#1E1B4B]">
                        {user?.name}
                      </p>
                      <p className="text-xs capitalize text-[#1E1B4B]/60">
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
