import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Mail,
  Lock,
  Bell,
  Users,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle,
  Github,
  Star,
  Smartphone,
  Layout,
  Menu,
  X,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const [stars, setStars] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("https://api.github.com/repos/Kieransaunders/convex-broadcast")
      .then((res) => res.json())
      .then((data) => {
        if (data.stargazers_count !== undefined) {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {
        // Silently fail - stars are not critical
      });
  }, []);

  const formatStars = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF]">
      {/* Navigation */}
      <nav className="border-b border-[#6366F1]/10 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366F1]">
                <Mail className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-[#1E1B4B]">
                Org Comms
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <a
                href="https://github.com/Kieransaunders/convex-broadcast"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-[#6366F1]/20 bg-white px-3 py-1.5 text-sm font-medium text-[#1E1B4B] hover:border-[#6366F1]/40 hover:bg-[#6366F1]/5 transition-colors"
              >
                <Github className="h-4 w-4" />
                <span>Star</span>
                <span className="flex items-center gap-1 rounded bg-[#6366F1]/10 px-1.5 py-0.5 text-xs font-semibold text-[#6366F1]">
                  <Star className="h-3 w-3 fill-[#6366F1]" />
                  {stars !== null ? formatStars(stars) : "—"}
                </span>
              </a>
              <Link
                to="/sign-in"
                className="text-sm font-medium text-[#1E1B4B] hover:text-[#6366F1]"
              >
                Sign In
              </Link>
              <Button className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white">
                <Link to="/sign-up">Get Started</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg text-[#1E1B4B] hover:bg-[#6366F1]/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-[#6366F1]/10 py-4 space-y-3">
              <a
                href="https://github.com/Kieransaunders/convex-broadcast"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg border border-[#6366F1]/20 bg-white px-4 py-2.5 text-sm font-medium text-[#1E1B4B] hover:border-[#6366F1]/40 hover:bg-[#6366F1]/5 transition-colors"
              >
                <Github className="h-4 w-4" />
                <span>Star on GitHub</span>
                <span className="flex items-center gap-1 rounded bg-[#6366F1]/10 px-1.5 py-0.5 text-xs font-semibold text-[#6366F1]">
                  <Star className="h-3 w-3 fill-[#6366F1]" />
                  {stars !== null ? formatStars(stars) : "—"}
                </span>
              </a>
              <Link
                to="/sign-in"
                className="flex items-center justify-center w-full rounded-lg px-4 py-2.5 text-sm font-medium text-[#1E1B4B] hover:bg-[#6366F1]/10 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Button 
                className="w-full bg-[#6366F1] hover:bg-[#6366F1]/90 text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link to="/sign-up" className="w-full">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#6366F1]/10 px-4 py-1.5 text-sm font-medium text-[#6366F1] mb-8">
            <Zap className="h-4 w-4" />
            Streamline your organization communications
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[#1E1B4B] sm:text-6xl mb-6">
            Keep your team
            <span className="text-[#6366F1]"> connected</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[#1E1B4B]/70 mb-10">
            Org Comms is the all-in-one communication platform for
            organizations. Send messages, manage events, and keep everyone
            informed with ease.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white px-8"
            >
              <Link to="/sign-up" className="flex items-center">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-[#6366F1]/20 text-[#6366F1] hover:bg-[#6366F1]/10"
            >
              <Link to="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Demo Credentials Section */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg">
          <Card className="border-[#6366F1]/20 bg-white shadow-lg overflow-hidden">
            <div className="bg-[#6366F1] px-6 py-3">
              <div className="flex items-center gap-2 text-white">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-semibold">Try the demo — test push notifications instantly</span>
              </div>
            </div>
            <CardContent className="pt-5 pb-6">
              <p className="text-sm text-[#1E1B4B]/60 mb-4">
                Sign in with the demo admin account to send messages and test browser push notifications.
              </p>
              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-3 rounded-lg bg-[#F5F3FF] px-4 py-2.5">
                  <Mail className="h-4 w-4 text-[#6366F1] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-[#1E1B4B]/50">Email</span>
                    <p className="text-sm font-mono font-medium text-[#1E1B4B]">demo@orgcomms.test</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-[#F5F3FF] px-4 py-2.5">
                  <Lock className="h-4 w-4 text-[#6366F1] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-[#1E1B4B]/50">Password</span>
                    <p className="text-sm font-mono font-medium text-[#1E1B4B]">demopass123!</p>
                  </div>
                </div>
              </div>
              <Button
                className="w-full bg-[#6366F1] hover:bg-[#6366F1]/90 text-white"
                size="lg"
              >
                <Link
                  to="/sign-in"
                  search={{ demo: true }}
                  className="flex items-center justify-center w-full"
                >
                  Try Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Start Guide for Testers */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-white/50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1E1B4B]">
              Quick Start for Testers
            </h2>
            <p className="text-[#1E1B4B]/70 mt-2">
              Follow these steps to experience the full power of the Org Comms boilerplate.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#6366F1] text-white font-bold shadow-lg shadow-[#6366F1]/20">
                1
              </div>
              <h3 className="font-bold text-[#1E1B4B] mb-2">Login as Admin</h3>
              <p className="text-sm text-[#1E1B4B]/60 italic mb-3">demo@orgcomms.test</p>
              <p className="text-sm text-[#1E1B4B]/70">
                Use the demo account above to access both Member and Admin capabilities.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#6366F1] text-white font-bold shadow-lg shadow-[#6366F1]/20">
                2
              </div>
              <h3 className="font-bold text-[#1E1B4B] mb-2">Enable Alerts</h3>
              <div className="mb-3 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">
                REQUIRED FOR PUSH
              </div>
              <p className="text-sm text-[#1E1B4B]/70">
                On the Feed page, click <strong>"Enable Alerts"</strong> to grant push permissions in your browser.{" "}
                <Link to="/docs/notifications" className="text-[#6366F1] underline hover:text-[#6366F1]/80">
                  Why this is needed.
                </Link>
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#6366F1] text-white font-bold shadow-lg shadow-[#6366F1]/20">
                3
              </div>
              <h3 className="font-bold text-[#1E1B4B] mb-2">Send Message</h3>
              <p className="text-sm text-[#1E1B4B]/70">
                Go to the <strong>Admin Dashboard</strong>, create a message, and send or schedule it for 1 minute time.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#6366F1] text-white font-bold shadow-lg shadow-[#6366F1]/20">
                4
              </div>
              <h3 className="font-bold text-[#1E1B4B] mb-2">Install App</h3>
              <div className="flex gap-2 mb-3">
                <Smartphone className="h-4 w-4 text-[#6366F1]" />
                <Layout className="h-4 w-4 text-[#6366F1]" />
              </div>
              <p className="text-sm text-[#1E1B4B]/70">
                Add to Home Screen on iOS/Android to test the full <strong>PWA experience</strong> and notifications.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#1E1B4B] mb-4">
              Everything you need to communicate
            </h2>
            <p className="text-[#1E1B4B]/70 max-w-2xl mx-auto">
              Powerful features designed to make organizational communication
              simple and effective.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Mail}
              title="Broadcast Messages"
              description="Send targeted messages to specific groups or your entire organization instantly."
            />
            <FeatureCard
              icon={Bell}
              title="Push Notifications"
              description="Reach your team anywhere with instant push notifications. Works on Desktop and Mobile (PWA)."
              link="/docs/notifications"
            />
            <FeatureCard
              icon={Users}
              title="Group Management"
              description="Organize your members into groups for targeted communications."
            />
            <FeatureCard
              icon={Shield}
              title="Role-Based Access"
              description="Control who can send messages and manage your organization."
            />
            <FeatureCard
              icon={Globe}
              title="Event Management"
              description="Schedule events and send automatic updates to attendees."
            />
            <FeatureCard
              icon={CheckCircle}
              title="Delivery Tracking"
              description="Know who has read your messages with real-time delivery stats."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Card className="border-none bg-gradient-to-r from-[#6366F1] to-[#818CF8]">
            <CardContent className="py-16 px-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to transform your communications?
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Join organizations already using Org Comms to keep their teams
                connected and informed.
              </p>
              <Button
                size="lg"
                className="bg-white text-[#6366F1] hover:bg-white/90"
              >
                <Link to="/sign-up" className="flex items-center">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#6366F1]/10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#6366F1]">
              <Mail className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-medium text-[#1E1B4B]">
              Org Comms
            </span>
          </div>
          <p className="text-sm text-[#1E1B4B]/60">
            © {new Date().getFullYear()} Org Comms. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  link,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  link?: string;
}) {
  const content = (
    <CardContent className="pt-6">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#6366F1]/10">
        <Icon className="h-5 w-5 text-[#6366F1]" />
      </div>
      <h3 className="text-lg font-semibold text-[#1E1B4B] mb-2">{title}</h3>
      <p className="text-sm text-[#1E1B4B]/70">{description}</p>
    </CardContent>
  );

  return (
    <Card className="border-[#6366F1]/10 bg-white hover:shadow-lg transition-shadow">
      {link ? (
        <Link to={link as any}>
          {content}
        </Link>
      ) : (
        content
      )}
    </Card>
  );
}
