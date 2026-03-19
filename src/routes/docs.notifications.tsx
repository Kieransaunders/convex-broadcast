import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bell,
  CheckCircle,
  Code,
  Globe,
  Lock,
  Shield,
  Smartphone,
  Zap,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export const Route = createFileRoute("/docs/notifications")({
  component: NotificationsDocsPage,
  head: () => ({
    meta: [
      {
        title: "Mastering Web Push Notifications in React Apps | Org Comms Guide",
      },
      {
        name: "description",
        content:
          "Learn how to implement robust, cross-platform Web Push notifications in your React application using Service Workers, VAPID keys, and modern backend integration.",
      },
    ],
  }),
});

function NotificationsDocsPage() {
  return (
    <div className="min-h-screen bg-[#F5F3FF]">
      {/* Header */}
      <nav className="border-b border-[#6366F1]/10 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4 text-[#6366F1]" />
              <span className="text-sm font-medium text-[#1E1B4B]">Back to Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366F1]">
                <Bell className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-[#1E1B4B]">Docs</span>
            </div>
            <div className="w-24" /> {/* Spacer */}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <article className="prose prose-slate prose-indigo max-w-none">
          <section className="mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#6366F1]/10 px-4 py-1.5 text-sm font-medium text-[#6366F1] mb-6">
              <Zap className="h-4 w-4" />
              Technical Guide
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#1E1B4B] sm:text-5xl mb-6">
              Implementing Web Push Notifications in React
            </h1>
            <p className="text-xl text-[#1E1B4B]/70 leading-relaxed">
              Web Push notifications allow you to re-engage users even when your application isn't open in the browser. Using the Org Comms boilerplate, you can deploy a robust notification system that works across desktop and mobile devices.
            </p>
          </section>

          <div className="grid gap-8 mb-16">
            <h2 className="text-3xl font-bold text-[#1E1B4B]">How it Works</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="border-[#6366F1]/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5 text-[#6366F1]" />
                    VAPID Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-[#1E1B4B]/70 text-sm">
                  VAPID (Voluntary Application Server Identification) keys authenticate your server with the push delivery service, preventing unauthorized notifications.
                </CardContent>
              </Card>
              <Card className="border-[#6366F1]/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Code className="h-5 w-5 text-[#6366F1]" />
                    Service Workers
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-[#1E1B4B]/70 text-sm">
                  The Service Worker runs in the background, listening for push events and displaying the notification even when the main tab is closed.
                </CardContent>
              </Card>
            </div>
          </div>

          <section className="bg-white rounded-2xl p-8 border border-[#6366F1]/10 shadow-sm mb-16">
            <h2 className="text-2xl font-bold text-[#1E1B4B] mb-6">The Implementation Chain</h2>
            <div className="space-y-6">
              {[
                {
                  title: "User Permission",
                  desc: "Modern browsers require a manual user gesture to request notification permissions. This is why Org Comms includes an 'Enable Alerts' button.",
                  icon: Pointer,
                },
                {
                  title: "Subscription Creation",
                  desc: "Once permitted, the browser generates a unique endpoint and cryptographic keys for that specific browser instance.",
                  icon: Globe,
                },
                {
                  title: "Secure Storage",
                  desc: "Subscriptions are stored in Convex and linked to the user account, allowing targeted broadcasts without managing complex infra.",
                  icon: Lock,
                },
                {
                  title: "Broadcast Delivery",
                  desc: "When an admin sends a message, an internal Node.js action in Convex triggers the web-push protocol to reach the user.",
                  icon: Send,
                },
              ].map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6366F1] text-white text-xs font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1E1B4B]">{step.title}</h3>
                    <p className="text-sm text-[#1E1B4B]/70">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold text-[#1E1B4B] mb-6">Optimizing for Mobile (PWA)</h2>
            <div className="rounded-xl bg-[#1E1B4B] p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="mb-6 opacity-80">
                  To get a native-like notification experience on iOS and Android, it is highly recommended to install the application as a PWA.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#10B981] shrink-0 mt-0.5" />
                    <span><strong>Persistence:</strong> PWA apps maintain background sync more reliably.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#10B981] shrink-0 mt-0.5" />
                    <span><strong>Badging:</strong> App icon badges can reflect the number of unread alerts.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#10B981] shrink-0 mt-0.5" />
                    <span><strong>Trust:</strong> Homescreen apps usually have higher permission retention.</span>
                  </li>
                </ul>
              </div>
              <Smartphone className="absolute -bottom-10 -right-10 h-64 w-64 text-white/5 rotate-12" />
            </div>
          </section>

          <footer className="text-center pt-8 border-t border-[#6366F1]/10">
            <h3 className="text-xl font-bold text-[#1E1B4B] mb-4">Ready to start broadcasting?</h3>
            <Button size="lg" className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white">
              <Link to="/sign-in">Return to App</Link>
            </Button>
          </footer>
        </article>
      </main>
    </div>
  );
}

function Pointer(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 14a8 8 0 0 1-8 8" />
      <path d="M18 11a4 4 0 1 0-4-4v10a2 2 0 1 1-4 0V7a4 4 0 1 0-4 4v2a8 8 0 0 0 8 8" />
    </svg>
  );
}

function Send(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}
