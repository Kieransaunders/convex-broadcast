import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bell,
  CheckCircle,
  Github,
  Globe,
  Mail,
  Menu,
  Shield,
  Smartphone,
  Star,
  Users,
  X,
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
              <a
                href="https://github.com/Kieransaunders/convex-broadcast"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white">
                  <Github className="mr-2 h-4 w-4" />
                  Get the Code
                </Button>
              </a>
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
              <a
                href="https://github.com/Kieransaunders/convex-broadcast"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button className="w-full bg-[#6366F1] hover:bg-[#6366F1]/90 text-white">
                  <Github className="mr-2 h-4 w-4" />
                  Get the Code
                </Button>
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Text content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#6366F1]/10 px-4 py-1.5 text-sm font-medium text-[#6366F1] mb-8">
                <Github className="h-4 w-4" />
                Free Open Source Boilerplate
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-[#1E1B4B] sm:text-5xl lg:text-6xl mb-6">
                Build your own
                <span className="text-[#6366F1]"> organisation communication app</span>
              </h1>
              <p className="text-lg text-[#1E1B4B]/70 mb-6 max-w-xl">
                Org Comms is a <strong>free, self-hosted boilerplate</strong> for charities,
                community groups, and organisations who need to communicate with their members,
                staff, or volunteers.
              </p>
              <p className="text-base text-[#1E1B4B]/60 mb-10 max-w-lg">
                Not a SaaS. You deploy it once for your organisation, add your branding,
                and own your data. Free for charities and small businesses.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
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
                <Link to="/sign-in" search={{ demo: true }}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-[#6366F1]/20 text-[#6366F1] hover:bg-[#6366F1]/10"
                  >
                    Try the demo
                  </Button>
                </Link>
              </div>
            </div>

            {/* App mockup */}
            <div className="hidden lg:block flex-shrink-0 w-72">
              <div className="relative mx-auto">
                {/* Phone frame */}
                <div className="rounded-3xl border-4 border-[#1E1B4B]/10 bg-white shadow-2xl shadow-[#6366F1]/10 overflow-hidden">
                  {/* Status bar */}
                  <div className="bg-[#6366F1] px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-white/20 flex items-center justify-center">
                        <Mail className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-white text-sm font-semibold">YourOrg App</span>
                    </div>
                    <Bell className="h-4 w-4 text-white/80" />
                  </div>

                  {/* Message feed */}
                  <div className="divide-y divide-[#6366F1]/5">
                    {/* Message 1 */}
                    <div className="px-4 py-3">
                      <div className="flex items-start gap-2 mb-1">
                        <span className="text-base">📢</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#1E1B4B] truncate">Emergency closure today</p>
                          <p className="text-xs text-[#1E1B4B]/60 mt-0.5 line-clamp-2">The building will be closed due to maintenance. Please work from home.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-[#1E1B4B]/40 flex items-center gap-1">
                          <Users className="h-3 w-3" /> 142 members
                        </span>
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> 98 read
                        </span>
                      </div>
                    </div>

                    {/* Message 2 */}
                    <div className="px-4 py-3">
                      <div className="flex items-start gap-2 mb-1">
                        <span className="text-base">📅</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#1E1B4B] truncate">Volunteer shift — Saturday</p>
                          <p className="text-xs text-[#1E1B4B]/60 mt-0.5 line-clamp-2">We need 6 volunteers for the community event this Saturday at 10am.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-[#1E1B4B]/40 flex items-center gap-1">
                          <Users className="h-3 w-3" /> Volunteers
                        </span>
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> 34 read
                        </span>
                      </div>
                    </div>

                    {/* Message 3 */}
                    <div className="px-4 py-3 bg-[#6366F1]/3">
                      <div className="flex items-start gap-2 mb-1">
                        <span className="text-base">🔔</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#1E1B4B] truncate">Monthly newsletter — March</p>
                          <p className="text-xs text-[#1E1B4B]/60 mt-0.5 line-clamp-2">Read about what's happening across the organisation this month.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-[#1E1B4B]/40 flex items-center gap-1">
                          <Users className="h-3 w-3" /> All members
                        </span>
                        <span className="text-xs text-[#1E1B4B]/40 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> 12 read
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom bar */}
                  <div className="px-4 py-2 bg-[#F5F3FF] flex items-center justify-center gap-1">
                    <Smartphone className="h-3 w-3 text-[#6366F1]/60" />
                    <span className="text-xs text-[#6366F1]/60">Installs as a PWA on any phone</span>
                  </div>
                </div>

                {/* Push notification toast */}
                <div className="absolute -top-3 -right-4 bg-white rounded-xl shadow-lg border border-[#6366F1]/10 px-3 py-2 flex items-center gap-2 w-52">
                  <div className="h-7 w-7 rounded bg-[#6366F1] flex items-center justify-center shrink-0">
                    <Bell className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#1E1B4B] truncate">YourOrg App</p>
                    <p className="text-xs text-[#1E1B4B]/60 truncate">New message from Admin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who Is This For + Demo */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-white/50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1E1B4B] mb-4">
              Built For Organisations Like Yours
            </h2>
            <p className="text-[#1E1B4B]/70 max-w-2xl mx-auto">
              If you need to communicate with a group of people and want your 
              own branded app instead of using WhatsApp, Slack, or email groups.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { icon: "💝", title: "Charities", desc: "Keep volunteers informed about opportunities and events" },
              { icon: "🏫", title: "Schools", desc: "Update parents on events, closures, and announcements" },
              { icon: "🏢", title: "Small Businesses", desc: "Coordinate staff without paying per-user fees" },
              { icon: "🤝", title: "Community Groups", desc: "Engage members with your own branded app" },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-[#6366F1]/10 rounded-xl p-5">
                <div className="text-2xl mb-2">{item.icon}</div>
                <h3 className="font-semibold text-[#1E1B4B] mb-1">{item.title}</h3>
                <p className="text-sm text-[#1E1B4B]/70">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Quick Demo Box */}
          <div className="bg-[#6366F1] rounded-xl p-6 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold mb-1">Try the Demo First</h3>
                <p className="text-white/80 text-sm">
                  Experience the full app with demo@orgcomms.test / demopass123!
                </p>
              </div>
              <Link to="/sign-in" search={{ demo: true }}>
                <Button
                  variant="outline"
                  className="border-white text-[#6366F1] bg-white hover:bg-white/90 shrink-0"
                >
                  Test the Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What This Is Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#1E1B4B] mb-3">
              Be clear on what you're getting
            </h2>
            <p className="text-[#1E1B4B]/70 max-w-2xl mx-auto">
              This is a developer boilerplate, not a hosted service. Read this before you get started.
            </p>
          </div>
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
                    <span>You <strong>self-host it</strong> — we don't host it for you</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>You <strong>customise everything</strong> — name, logo, colours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>You <strong>own your data</strong> — stays in your database</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Members install <strong>your branded app</strong> — not "Org Comms"</span>
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
                    <span><strong>Not a SaaS</strong> — no monthly subscription to us</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span><strong>Not a service</strong> — you deploy and run it yourself</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span><strong>Not multi-tenant</strong> — one deployment per org</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span><strong>Not for resale</strong> — can't sell to other companies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span><strong>Not a finished product</strong> — you'll need a developer</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
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

          <div className="mt-12 p-6 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="text-2xl">⚠️</div>
              <div>
                <h4 className="font-semibold text-amber-900 mb-1">
                  Requires Technical Knowledge
                </h4>
                <p className="text-sm text-amber-800">
                  You'll need someone who knows React/TypeScript to customise and deploy this. 
                  If you don't have a developer,{" "}
                  <a 
                    href="https://iConnectIT.co.uk" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    iConenctIT.co.uk
                  </a>{" "}
                  can help you build and deploy your customised app.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-white/50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1E1B4B] mb-4">
              Why Build Your Own Instead of Using WhatsApp or Slack?
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#6366F1]/20">
                  <th className="text-left py-4 px-4 font-semibold text-[#1E1B4B]">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-[#1E1B4B]">WhatsApp Groups</th>
                  <th className="text-center py-4 px-4 font-semibold text-[#1E1B4B]">Slack/Teams</th>
                  <th className="text-center py-4 px-4 font-semibold text-[#6366F1] bg-[#6366F1]/5 rounded-t-lg">
                    Your Branded App
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { feature: "Your branding & name", whatsapp: "❌ No", slack: "❌ No", orgcomms: "✅ Yes" },
                  { feature: "Members see your logo on their phone", whatsapp: "❌ No", slack: "❌ No", orgcomms: "✅ Yes" },
                  { feature: "Broadcast-only (no reply chaos)", whatsapp: "❌ No", slack: "❌ No", orgcomms: "✅ Yes" },
                  { feature: "Delivery & read receipts", whatsapp: "⚠️ Limited", slack: "❌ No", orgcomms: "✅ Full tracking" },
                  { feature: "Target specific groups easily", whatsapp: "❌ Manual", slack: "✅ Yes", orgcomms: "✅ Yes" },
                  { feature: "No per-user monthly fees", whatsapp: "✅ Free", slack: "❌ Paid", orgcomms: "✅ Free" },
                  { feature: "You own the data", whatsapp: "❌ Meta owns it", slack: "❌ Slack owns it", orgcomms: "✅ You own it" },
                  { feature: "No ads or distractions", whatsapp: "❌ Ads", slack: "✅ No ads", orgcomms: "✅ No ads" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-[#6366F1]/10">
                    <td className="py-3 px-4 text-[#1E1B4B]">{row.feature}</td>
                    <td className="py-3 px-4 text-center text-[#1E1B4B]/70">{row.whatsapp}</td>
                    <td className="py-3 px-4 text-center text-[#1E1B4B]/70">{row.slack}</td>
                    <td className="py-3 px-4 text-center bg-[#6366F1]/5 font-medium text-[#6366F1]">{row.orgcomms}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Build Upon This Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-white/50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1E1B4B] mb-4">
              Build Upon This Starter
            </h2>
            <p className="text-[#1E1B4B]/70 max-w-2xl mx-auto">
              Org Comms is a foundation you can extend. Here are some ways 
              organisations have customised it for their needs.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-[#6366F1]/10 bg-white h-full">
              <CardContent className="pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 mb-4">
                  <span className="text-xl">🚨</span>
                </div>
                <h3 className="font-semibold text-[#1E1B4B] mb-2">
                  Emergency Alert System
                </h3>
                <p className="text-sm text-[#1E1B4B]/70">
                  Add priority levels, loud alarm notifications, and instant 
                  SMS fallback for critical safety alerts to all staff or residents.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#6366F1]/10 bg-white h-full">
              <CardContent className="pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 mb-4">
                  <span className="text-xl">📋</span>
                </div>
                <h3 className="font-semibold text-[#1E1B4B] mb-2">
                  Volunteer Coordination
                </h3>
                <p className="text-sm text-[#1E1B4B]/70">
                  Add shift sign-ups, availability calendars, and skill matching 
                  so volunteers can easily manage their commitments.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#6366F1]/10 bg-white h-full">
              <CardContent className="pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 mb-4">
                  <span className="text-xl">📚</span>
                </div>
                <h3 className="font-semibold text-[#1E1B4B] mb-2">
                  School Parent Portal
                </h3>
                <p className="text-sm text-[#1E1B4B]/70">
                  Add class-specific channels, homework updates, permission slips 
                  with digital signatures, and parent-teacher meeting booking.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#6366F1]/10 bg-white h-full">
              <CardContent className="pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 mb-4">
                  <span className="text-xl">🏥</span>
                </div>
                <h3 className="font-semibold text-[#1E1B4B] mb-2">
                  Healthcare Updates
                </h3>
                <p className="text-sm text-[#1E1B4B]/70">
                  Add appointment reminders, care plan updates for families, 
                  and secure document sharing between patients and providers.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-[#1E1B4B]/60">
              These are just ideas — you can extend Org Comms with any features 
              your organisation needs.
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
                Ready to build your organisation's app?
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Fork the repository, customise it with your branding, and deploy 
                your own communication platform.
              </p>
              <a
                href="https://github.com/Kieransaunders/convex-broadcast"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="bg-white text-[#6366F1] hover:bg-white/90"
                >
                  <Github className="mr-2 h-5 w-5" />
                  Get the Code on GitHub
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#6366F1]/10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#6366F1]">
              <Mail className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-medium text-[#1E1B4B]">
              Org Comms
            </span>
          </div>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link to="/docs" className="text-sm text-[#1E1B4B]/60 hover:text-[#6366F1] transition-colors">Docs</Link>
            <Link to="/articles" className="text-sm text-[#1E1B4B]/60 hover:text-[#6366F1] transition-colors">Articles</Link>
            <Link to="/docs/licensing" className="text-sm text-[#1E1B4B]/60 hover:text-[#6366F1] transition-colors">License</Link>
            <a
              href="https://github.com/Kieransaunders/convex-broadcast"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#1E1B4B]/60 hover:text-[#6366F1] transition-colors"
            >
              GitHub
            </a>
          </nav>
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
