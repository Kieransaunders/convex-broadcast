import { Link, createFileRoute } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Mail,
  Bell,
  Users,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F5F3FF]">
      {/* Navigation */}
      <nav className="border-b border-[#6366F1]/10 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366F1]">
                <Mail className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-[#1E1B4B]">
                Org Comms
              </span>
            </div>
            <div className="flex items-center gap-4">
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
          </div>
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

      {/* Features Section */}
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
              description="Reach your team anywhere with instant push notifications to their devices."
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
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-[#6366F1]/10 bg-white hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#6366F1]/10">
          <Icon className="h-5 w-5 text-[#6366F1]" />
        </div>
        <h3 className="text-lg font-semibold text-[#1E1B4B] mb-2">{title}</h3>
        <p className="text-sm text-[#1E1B4B]/70">{description}</p>
      </CardContent>
    </Card>
  );
}
