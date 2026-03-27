import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bell,
  CheckCircle,
  Github,
  Globe,
  Layout,
  Lock,
  Mail,
  Menu,
  Shield,
  Smartphone,
  Star,
  Users,
  X,
  Zap,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Org Comms | Internal Communication App for Organisations",
      },
      {
        name: "description",
        content:
          "Broadcast messages to members, staff, and volunteers with Org Comms, the internal communication app for organisations.",
      },
      {
        property: "og:title",
        content: "Org Comms | Internal Communication App for Organisations",
      },
      {
        property: "og:description",
        content:
          "Broadcast messages to members, staff, and volunteers with Org Comms, the internal communication app for organisations.",
      },
      { property: "og:url", content: "https://orgcomms.app" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
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
                to="/docs"
                className="text-sm font-medium text-[#1E1B4B] hover:text-[#6366F1]"
              >
                Docs
              </Link>
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
                to="/docs"
                className="flex items-center justify-center w-full rounded-lg px-4 py-2.5 text-sm font-medium text-[#1E1B4B] hover:bg-[#6366F1]/10 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Docs
              </Link>
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
            <Github className="h-4 w-4" />
            Free Open Source Boilerplate
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[#1E1B4B] sm:text-6xl mb-6">
            Build your own
            <span className="text-[#6366F1]"> organisation communication app</span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-[#1E1B4B]/70 mb-6">
            Org Comms is a <strong>free, self-hosted boilerplate</strong> for charities, 
            community groups, and organisations who need to communicate with their members, 
            staff, or volunteers.
          </p>
          <p className="mx-auto max-w-2xl text-base text-[#1E1B4B]/60 mb-10">
            Not a SaaS. You deploy it once for your organisation, add your branding, 
            and own your data. Free for charities and small businesses.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com/Kieransaunders/convex-broadcast"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white px-8"
              >
                <Github className="mr-2 h-5 w-5" />
                Get the Code on GitHub
              </Button>
            </a>
            <Button
              variant="outline"
              size="lg"
              className="border-[#6366F1]/20 text-[#6366F1] hover:bg-[#6366F1]/10"
            >
              <Link to="/sign-in" search={{ demo: true }}>
                Test the demo
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* What This Is Section */}
      <section className="px-4 py-12 sm:px-6 lg:px-8 bg-white/50">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-green-200 bg-green-50/30">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-[#1E1B4B] mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  What this IS
                </h3>
                <ul className="space-y-3 text-sm text-[#1E1B4B]/80">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>A <strong>free starting point</strong> for building your own app</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>You <strong>self-host it</strong> for your own organisation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>You <strong>customise the branding</strong> (logo, colours, name)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>You <strong>own your data</strong> — it stays in your database</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Your members install <strong>your branded app</strong> on their phones</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50/30">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-[#1E1B4B] mb-3 flex items-center gap-2">
                  <X className="h-5 w-5 text-red-500" />
                  What this is NOT
                </h3>
                <ul className="space-y-3 text-sm text-[#1E1B4B]/80">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span><strong>Not a SaaS</strong> you sign up for monthly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span><strong>Not a service</strong> we host for you</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span><strong>Not multi-tenant</strong> — one deployment per organisation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span><strong>Not for resale</strong> — you can't sell it to other companies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span><strong>Not a finished product</strong> — it's code you build on</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
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
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1E1B4B]">
              How It Works
            </h2>
            <p className="text-[#1E1B4B]/70 mt-2 max-w-2xl mx-auto">
              Three simple steps to have your own branded communication app 
              for your organisation.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#6366F1] text-white font-bold shadow-lg shadow-[#6366F1]/20">
                1
              </div>
              <h3 className="font-bold text-[#1E1B4B] mb-2">Fork & Deploy</h3>
              <p className="text-sm text-[#1E1B4B]/70">
                Fork the repo and deploy to Vercel or Netlify. 
                One deployment = one organisation.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#6366F1] text-white font-bold shadow-lg shadow-[#6366F1]/20">
                2
              </div>
              <h3 className="font-bold text-[#1E1B4B] mb-2">Add Your Branding</h3>
              <p className="text-sm text-[#1E1B4B]/70">
                Change the name, logo, colours, and domain. 
                Make it look like <em>your</em> app.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#6366F1] text-white font-bold shadow-lg shadow-[#6366F1]/20">
                3
              </div>
              <h3 className="font-bold text-[#1E1B4B] mb-2">Invite Your Members</h3>
              <p className="text-sm text-[#1E1B4B]/70">
                Add your members, create groups, and start broadcasting. 
                They install your branded PWA on their phones.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Card className="border-[#6366F1]/20 bg-white max-w-2xl mx-auto">
              <CardContent className="py-6">
                <p className="text-sm text-[#1E1B4B]/70 mb-4">
                  Want to try it first? The demo lets you experience the full app 
                  with a pre-configured account.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <div className="flex items-center gap-3 rounded-lg bg-[#F5F3FF] px-4 py-2 text-sm">
                    <Mail className="h-4 w-4 text-[#6366F1]" />
                    <span className="font-mono text-[#1E1B4B]">demo@orgcomms.test</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-[#F5F3FF] px-4 py-2 text-sm">
                    <Lock className="h-4 w-4 text-[#6366F1]" />
                    <span className="font-mono text-[#1E1B4B]">demopass123!</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-[#1E1B4B]/60 text-sm">
              Need help building your perfect communication app?{" "}
              <a 
                href="https://iConenctIT.co.uk" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#6366F1] font-medium hover:underline"
              >
                iConenctIT.co.uk
              </a>{" "}
              can help you customise and deploy Org Comms for your organisation.
            </p>
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
              link="/docs/broadcast-messages"
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
              link="/docs/group-management"
            />
            <FeatureCard
              icon={Shield}
              title="Role-Based Access"
              description="Control who can send messages and manage your organization."
              link="/docs/role-based-access"
            />
            <FeatureCard
              icon={Globe}
              title="Event Management"
              description="Schedule events and send automatic updates to attendees."
              link="/docs/event-management"
            />
            <FeatureCard
              icon={CheckCircle}
              title="Delivery Tracking"
              description="Know who has read your messages with real-time delivery stats."
              link="/docs/delivery-tracking"
            />
          </div>
        </div>
      </section>

      {/* Articles & Resources Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-white/50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1E1B4B] mb-4">
              Communication Resources
            </h2>
            <p className="text-[#1E1B4B]/70 max-w-2xl mx-auto">
              Practical guides to help your organisation communicate better
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
            {[
              {
                category: "Communication Strategy",
                title: "The Real Cost of Poor Internal Communication",
                desc: "Discover how communication failures cost organisations time, money, and member engagement.",
                slug: "real-cost-of-poor-internal-communication",
              },
              {
                category: "Tools & Technology",
                title: "Group Chat vs Broadcast Messaging",
                desc: "Understand when to use each communication mode and which is right for your organisation.",
                slug: "group-chat-vs-broadcast-messaging",
              },
              {
                category: "Best Practices",
                title: "How to Build a Member Communication Strategy",
                desc: "A practical 6-step guide to building a communication strategy that actually works.",
                slug: "member-communication-strategy",
              },
            ].map((article) => (
              <Link
                key={article.slug}
                to="/articles/$slug"
                params={{ slug: article.slug }}
                className="group"
              >
                <Card className="border-[#6366F1]/10 bg-white hover:shadow-lg transition-shadow h-full">
                  <CardContent className="pt-6 flex flex-col h-full">
                    <span className="inline-block rounded-full bg-[#6366F1]/10 px-3 py-1 text-xs font-semibold text-[#6366F1] mb-3">
                      {article.category}
                    </span>
                    <h3 className="text-base font-semibold text-[#1E1B4B] mb-2 group-hover:text-[#6366F1] transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-[#1E1B4B]/70 mb-4 flex-1">
                      {article.desc}
                    </p>
                    <span className="text-sm font-medium text-[#6366F1]">
                      Read more →
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/articles"
              className="inline-flex items-center gap-1 text-sm font-medium text-[#6366F1] hover:text-[#6366F1]/80 transition-colors"
            >
              View All Articles →
            </Link>
          </div>
        </div>
      </section>

      {/* License Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Card className="border-[#6366F1]/10 bg-white">
            <CardContent className="py-12 px-8">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-2xl font-bold text-[#1E1B4B] mb-4">
                    Free for Charities & Small Businesses
                  </h2>
                  <p className="text-[#1E1B4B]/70 mb-6">
                    Org Comms is available under the Sustainable Use License. 
                    Use it for your own organisation at no cost.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                      <span className="text-sm text-[#1E1B4B]">
                        <strong>Free</strong> for charities & non-profits
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                      <span className="text-sm text-[#1E1B4B]">
                        <strong>Free</strong> for small businesses (&lt;50 employees)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                      <span className="text-sm text-[#1E1B4B]">
                        Self-host and customise with your branding
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <strong>Not permitted:</strong> Selling hosting services, 
                      multi-tenant SaaS, or reselling to third parties.
                    </p>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <Link to="/docs/licensing">
                    <Button
                      variant="outline"
                      className="border-[#6366F1] text-[#6366F1] hover:bg-[#6366F1]/10"
                    >
                      Read Full License
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
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
