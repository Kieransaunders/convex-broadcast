import { Link, useRouterState } from "@tanstack/react-router";
import React, { useState } from "react";
import {
  Bell,
  BookOpen,
  Globe,
  Mail,
  Menu,
  Shield,
  Users,
  X,
  BarChart2,
  ArrowRight,
} from "lucide-react";
import { Button } from "~/components/ui/button";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

const DOC_LINKS: NavItem[] = [
  { to: "/docs", label: "Overview", icon: BookOpen, exact: true },
  { to: "/docs/broadcast-messages", label: "Broadcast Messages", icon: Mail },
  { to: "/docs/notifications", label: "Push Notifications", icon: Bell },
  { to: "/docs/group-management", label: "Group Management", icon: Users },
  { to: "/docs/role-based-access", label: "Role-Based Access", icon: Shield },
  { to: "/docs/event-management", label: "Event Management", icon: Globe },
  { to: "/docs/delivery-tracking", label: "Delivery Tracking", icon: BarChart2 },
];

export function DocsNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return currentPath === to;
    return currentPath.startsWith(to);
  };

  return (
    <>
      {/* Top Nav */}
      <nav className="border-b border-[#6366F1]/10 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366F1]">
                <Mail className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-[#1E1B4B]">Org Comms</span>
              <span className="hidden sm:block text-sm text-[#6366F1]/60 font-medium border-l border-[#6366F1]/20 pl-3 ml-1">
                Docs
              </span>
            </Link>

            {/* Desktop: current section picker / nav */}
            <div className="hidden md:flex items-center gap-1">
              {DOC_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to as any}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.to, link.exact)
                        ? "bg-[#6366F1]/10 text-[#6366F1]"
                        : "text-[#1E1B4B]/60 hover:text-[#6366F1] hover:bg-[#6366F1]/5"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden lg:block">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                className="hidden sm:flex bg-[#6366F1] hover:bg-[#6366F1]/90 text-white"
              >
                <Link to="/sign-in" className="flex items-center gap-1">
                  Open App
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded-lg text-[#1E1B4B] hover:bg-[#6366F1]/10 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle docs menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile nav dropdown */}
          {mobileOpen && (
            <div className="md:hidden border-t border-[#6366F1]/10 py-3 space-y-1">
              {DOC_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to as any}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.to, link.exact)
                        ? "bg-[#6366F1]/10 text-[#6366F1]"
                        : "text-[#1E1B4B]/60 hover:text-[#6366F1] hover:bg-[#6366F1]/5"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-2 border-t border-[#6366F1]/10 mt-2">
                <Button className="w-full bg-[#6366F1] hover:bg-[#6366F1]/90 text-white">
                  <Link to="/sign-in" className="flex items-center justify-center gap-1 w-full">
                    Open App
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Page layout with sidebar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex gap-8 lg:gap-12">
          {/* Sidebar (desktop) */}
          <aside className="hidden md:block w-56 lg:w-64 shrink-0">
            <div className="sticky top-24 space-y-1">
              <p className="text-xs font-semibold text-[#1E1B4B]/40 uppercase tracking-wider px-3 mb-3">
                Features
              </p>
              {DOC_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to as any}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.to, link.exact)
                        ? "bg-[#6366F1] text-white shadow-sm shadow-[#6366F1]/30"
                        : "text-[#1E1B4B]/60 hover:text-[#6366F1] hover:bg-[#6366F1]/5"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-[#6366F1]/10 mt-4">
                <Link
                  to="/"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#1E1B4B]/40 hover:text-[#6366F1] transition-colors"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </aside>

          {/* Main content area — children render here */}
          <main className="flex-1 min-w-0">
          </main>
        </div>
      </div>
    </>
  );
}

/** Wrapper that provides the consistent docs page shell */
export function DocsPageShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return currentPath === to;
    return currentPath === to;
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF]">
      {/* Top Nav */}
      <nav className="border-b border-[#6366F1]/10 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366F1]">
                <Mail className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-[#1E1B4B]">Org Comms</span>
              <span className="hidden sm:block text-sm text-[#6366F1]/60 font-medium border-l border-[#6366F1]/20 pl-3 ml-1">
                Docs
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {DOC_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to as any}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.to, link.exact)
                        ? "bg-[#6366F1]/10 text-[#6366F1]"
                        : "text-[#1E1B4B]/60 hover:text-[#6366F1] hover:bg-[#6366F1]/5"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden lg:block">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="sm"
                className="hidden sm:flex bg-[#6366F1] hover:bg-[#6366F1]/90 text-white"
              >
                <Link to="/sign-in" className="flex items-center gap-1">
                  Open App
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
              <button
                className="md:hidden p-2 rounded-lg text-[#1E1B4B] hover:bg-[#6366F1]/10 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {mobileOpen && (
            <div className="md:hidden border-t border-[#6366F1]/10 py-3 space-y-1">
              {DOC_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to as any}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.to, link.exact)
                        ? "bg-[#6366F1]/10 text-[#6366F1]"
                        : "text-[#1E1B4B]/60 hover:text-[#6366F1] hover:bg-[#6366F1]/5"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-2 border-t border-[#6366F1]/10 mt-2">
                <Button className="w-full bg-[#6366F1] hover:bg-[#6366F1]/90 text-white">
                  <Link to="/sign-in" className="flex items-center justify-center gap-1 w-full">
                    Open App <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Body: sidebar + content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex gap-8 lg:gap-12">
          {/* Sidebar */}
          <aside className="hidden md:block w-56 lg:w-64 shrink-0">
            <div className="sticky top-24 space-y-1">
              <p className="text-xs font-semibold text-[#1E1B4B]/40 uppercase tracking-wider px-3 mb-3">
                Features
              </p>
              {DOC_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to as any}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.to, link.exact)
                        ? "bg-[#6366F1] text-white shadow-sm shadow-[#6366F1]/30"
                        : "text-[#1E1B4B]/60 hover:text-[#6366F1] hover:bg-[#6366F1]/5"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-[#6366F1]/10 mt-4">
                <Link
                  to="/"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#1E1B4B]/40 hover:text-[#6366F1] transition-colors"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#6366F1]/10 px-4 py-8 sm:px-6 lg:px-8 bg-white/50">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#6366F1]">
              <Mail className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-medium text-[#1E1B4B]">Org Comms</span>
          </Link>
          <nav className="flex flex-wrap gap-4 text-sm text-[#1E1B4B]/50">
            {DOC_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to as any}
                className="hover:text-[#6366F1] transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <p className="text-sm text-[#1E1B4B]/40">
            © {new Date().getFullYear()} Org Comms
          </p>
        </div>
      </footer>
    </div>
  );
}

export function FaqSection({
  items,
}: {
  items: { q: string; a: string }[];
}) {
  return (
    <section className="mt-12 mb-8">
      <h2 className="text-2xl font-bold text-[#1E1B4B] mb-6">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-[#6366F1]/10 p-6"
            itemScope
            itemType="https://schema.org/Question"
          >
            <h3
              className="font-semibold text-[#1E1B4B] mb-2 text-base"
              itemProp="name"
            >
              {item.q}
            </h3>
            <div
              className="text-sm text-[#1E1B4B]/70 leading-relaxed"
              itemScope
              itemType="https://schema.org/Answer"
              itemProp="acceptedAnswer"
            >
              <span itemProp="text">{item.a}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
