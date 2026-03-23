import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Calendar, Clock, Mail } from "lucide-react";
import { articles } from "~/lib/articles";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";

export const Route = createFileRoute("/articles/")({
  component: ArticlesIndexPage,
  head: () => ({
    meta: [
      {
        title: "Communication Resources & Articles | Org Comms",
      },
      {
        name: "description",
        content:
          "Expert articles on organisational communication strategy, broadcast messaging, push notifications, and member engagement.",
      },
      {
        property: "og:title",
        content: "Communication Resources & Articles | Org Comms",
      },
      {
        property: "og:description",
        content:
          "Expert articles on organisational communication strategy, broadcast messaging, push notifications, and member engagement.",
      },
      {
        property: "og:type",
        content: "website",
      },
    ],
  }),
});

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ArticlesIndexPage() {
  return (
    <div className="min-h-screen bg-[#F5F3FF]">
      {/* Navigation */}
      <nav className="border-b border-[#6366F1]/10 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366F1]">
                <Mail className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-[#1E1B4B] group-hover:text-[#6366F1] transition-colors">
                Org Comms
              </span>
            </Link>

            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm font-medium text-[#1E1B4B]/70 hover:text-[#6366F1] transition-colors"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#6366F1]/10 px-4 py-1.5 text-sm font-medium text-[#6366F1] mb-6">
            <BookOpen className="h-4 w-4" />
            Resources & Articles
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[#1E1B4B] sm:text-5xl mb-4">
            Communication Resources
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[#1E1B4B]/60 leading-relaxed">
            Practical guides, strategies, and insights to help you build better
            communication habits and keep your organisation connected.
          </p>
        </div>
      </section>

      {/* Article Grid */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {articles.length === 0 ? (
            <div className="text-center py-20 text-[#1E1B4B]/40">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No articles yet</p>
              <p className="text-sm mt-1">Check back soon.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {articles.map((article) => (
                <Link
                  key={article.slug}
                  to="/articles/$slug"
                  params={{ slug: article.slug }}
                  className="group block"
                >
                  <Card className="h-full border-[#6366F1]/10 bg-white hover:shadow-xl hover:border-[#6366F1]/30 transition-all duration-200">
                    <CardContent className="pt-6 pb-6 flex flex-col gap-4 h-full">
                      {/* Category Badge */}
                      <div>
                        <Badge
                          variant="secondary"
                          className="bg-[#6366F1]/10 text-[#6366F1] hover:bg-[#6366F1]/15 font-medium text-xs"
                        >
                          {article.category}
                        </Badge>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-bold text-[#1E1B4B] leading-snug group-hover:text-[#6366F1] transition-colors">
                        {article.title}
                      </h2>

                      {/* Intro */}
                      <p className="text-[#1E1B4B]/60 text-sm leading-relaxed line-clamp-3 flex-1">
                        {article.intro}
                      </p>

                      {/* Meta row */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#6366F1]/8">
                        <div className="flex items-center gap-4 text-xs text-[#1E1B4B]/50">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {article.readingTime}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(article.publishedAt)}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-xs font-semibold text-[#6366F1] group-hover:gap-2 transition-all">
                          Read Article
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#6366F1]/10 px-4 py-8 sm:px-6 lg:px-8 bg-white/50">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#6366F1]">
              <Mail className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-medium text-[#1E1B4B]">
              Org Comms
            </span>
          </div>
          <p className="text-sm text-[#1E1B4B]/50">
            © {new Date().getFullYear()} Org Comms. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
