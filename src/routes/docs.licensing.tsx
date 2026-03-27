import { Link, createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle,
  FileText,
  Heart,
  Info,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { DocsPageShell, FaqSection } from "~/components/docs-nav";

export const Route = createFileRoute("/docs/licensing")({
  component: LicensingPage,
  head: () => ({
    meta: [
      {
        title: "Licensing — Org Comms",
      },
      {
        name: "description",
        content:
          "Org Comms is available under the Sustainable Use License. Free for charities, non-profits, and small businesses. Learn what you can and cannot do with the software.",
      },
    ],
  }),
});

function LicensingPage() {
  return (
    <DocsPageShell>
      {/* Hero */}
      <section className="mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#6366F1]/10 px-4 py-1.5 text-sm font-medium text-[#6366F1] mb-6">
          <FileText className="h-4 w-4" />
          Sustainable Use License 1.0
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1E1B4B] sm:text-5xl mb-4">
          Free for Good Causes
        </h1>
        <p className="text-xl text-[#1E1B4B]/70 leading-relaxed max-w-3xl">
          Org Comms is available under the Sustainable Use License. This means 
          it's free for charities, non-profits, and small businesses to use for 
          their own internal communications.
        </p>
      </section>

      {/* Who Can Use For Free */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-[#1E1B4B] mb-6">
          Free to Use For
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <Heart className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1E1B4B] mb-1">
                    Charities & Non-Profits
                  </h3>
                  <p className="text-sm text-[#1E1B4B]/70">
                    Registered charities, community organisations, and non-profits 
                    can use Org Comms completely free of charge.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1E1B4B] mb-1">
                    Small Businesses
                  </h3>
                  <p className="text-sm text-[#1E1B4B]/70">
                    Businesses with fewer than 50 employees OR less than $1M 
                    annual revenue can use Org Comms for free.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <Info className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1E1B4B] mb-1">
                    Personal & Educational Use
                  </h3>
                  <p className="text-sm text-[#1E1B4B]/70">
                    Individuals learning the technology, personal projects, and 
                    educational institutions are all free to use Org Comms.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1E1B4B] mb-1">
                    Internal Organisation Use
                  </h3>
                  <p className="text-sm text-[#1E1B4B]/70">
                    Any organisation using Org Comms to communicate with their 
                    own members, staff, or volunteers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* What You Can Do */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-[#1E1B4B] mb-6">
          What You Can Do
        </h2>
        <Card className="border-[#6366F1]/10 bg-white">
          <CardContent className="pt-6">
            <ul className="space-y-4">
              {[
                "Self-host Org Comms on your own infrastructure",
                "Customise the branding, colours, and logo to match your organisation",
                "Add features specific to your organisation's needs",
                "Fork the repository and modify the code",
                "Deploy a single instance for your organisation",
                "Use it to communicate with your members, staff, or volunteers",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-[#1E1B4B]/80">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* What You Cannot Do */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-[#1E1B4B] mb-6">
          What You Cannot Do
        </h2>
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[#1E1B4B]/80 font-medium">
                The following uses require explicit written permission or a 
                commercial license:
              </p>
            </div>
            <ul className="space-y-4">
              {[
                "Host Org Comms as a service to sell to other companies",
                "Use it as part of a multi-tenant SaaS product",
                "Resell the software to third parties",
                "White-label and provide to clients as your own product",
                "Create a competing product based on this codebase",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-[#1E1B4B]/80">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Commercial License */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-[#1E1B4B] mb-6">
          Commercial License
        </h2>
        <Card className="border-[#6366F1]/10 bg-white">
          <CardContent className="pt-6">
            <p className="text-[#1E1B4B]/70 mb-6">
              If you are a larger organisation (50+ employees or $1M+ revenue) 
              and want to use Org Comms, or if you want to discuss alternative 
              licensing arrangements, please get in touch.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/Kieransaunders/convex-broadcast/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  className="border-[#6366F1]/20 text-[#6366F1] hover:bg-[#6366F1]/10"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Read Full License
                </Button>
              </a>
              <a
                href="https://github.com/Kieransaunders/convex-broadcast/issues"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white">
                  Contact for Commercial License
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FAQ */}
      <FaqSection
        items={[
          {
            q: "Can I use Org Comms for my charity?",
            a: "Yes! Charities and non-profit organisations can use Org Comms completely free of charge under the Sustainable Use License.",
          },
          {
            q: "Can I customise the app with my organisation's branding?",
            a: "Absolutely. You can change colours, logos, and even add custom features. The license explicitly permits modifications for your own internal use.",
          },
          {
            q: "Can I offer Org Comms as a service to my clients?",
            a: "No. Hosting Org Comms as a service for multiple clients or selling it as a product is not permitted without a commercial license. The license is designed for organisations to use it for their own internal communications.",
          },
          {
            q: "What if my organisation grows beyond 50 employees?",
            a: "If your organisation grows beyond the small business threshold, you should contact us to discuss a commercial license. We're reasonable and want to support growing organisations.",
          },
          {
            q: "Can I contribute to the project?",
            a: "Yes! Contributions are welcome. By contributing code, you agree that your contributions will be licensed under the same Sustainable Use License.",
          },
          {
            q: "Is the license open source?",
            a: "The Sustainable Use License is not an OSI-approved open source license because it has usage restrictions (no SaaS/resale). However, the full source code is available and you have significant freedoms to use, modify, and self-host for your own organisation.",
          },
        ]}
      />
    </DocsPageShell>
  );
}
