import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Settings, LayoutDashboard } from "lucide-react";
import { cn } from "~/lib/utils";

interface MobileBottomNavProps {
  isAdmin?: boolean;
  unreadCount?: number;
}

export function MobileBottomNav({ isAdmin, unreadCount }: MobileBottomNavProps) {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const navItems = [
    {
      to: "/inbox",
      label: "Messages",
      icon: Home,
      active: currentPath === "/inbox" || currentPath.startsWith("/messages/"),
    },
    {
      to: "/settings",
      label: "Settings",
      icon: Settings,
      active: currentPath === "/settings",
    },
    ...(isAdmin
      ? [
          {
            to: "/dashboard",
            label: "Admin",
            icon: LayoutDashboard,
            active: currentPath.startsWith("/dashboard"),
          },
        ]
      : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] backdrop-blur-sm sm:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            aria-label={item.label}
            tabIndex={0}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-2 min-h-[64px] cursor-pointer transition-all duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:ring-offset-2 focus-visible:rounded-lg",
              "active:scale-95",
              item.active
                ? "text-[#6366F1]"
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            <div className="relative">
              <item.icon className="h-5 w-5" />
              {item.to === "/inbox" && unreadCount ? (
                <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </div>
            <span className="text-xs font-medium">{item.label}</span>
            {/* Active indicator dot */}
            {item.active && (
              <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#6366F1]" />
            )}
          </Link>
        ))}
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </nav>
  );
}
