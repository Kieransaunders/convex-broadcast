import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Mail,
  Tag,
} from "lucide-react";
import { useState } from "react";
import { articles, getArticleBySlug } from "~/lib/articles";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  ArticleJsonLd,
  BreadcrumbJsonLd,
  FAQJsonLd,
  HowToJsonLd,
} from "~/components/json-ld";

export const Route = createFileRoute("/articles/$slug")({
  loader: ({ params }) => {
    const article = getArticleBySlug(params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const { article } = loaderData;
    return {
      meta: [
        { title: article.metaTitle },
        { name: "description", content: article.metaDescription },
        { property: "og:title", content: article.metaTitle },
        { property: "og:description", content: article.metaDescription },
        { property: "og:type", content: "article" },
        {
          property: "og:article:published_time",
          content: article.publishedAt,
        },
        ...(article.tags[0]
          ? [{ property: "og:article:tag", content: article.tags[0] }]
          : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: article.metaTitle },
        { name: "twitter:description", content: article.metaDescription },
      ],
    };
  },
  component: ArticlePage,
});

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#6366F1]/10 last:border-0">
      <button
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <h3 className="text-base font-semibold text-[#1E1B4B] leading-snug">
          {question}
        </h3>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-[#6366F1]" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-[#6366F1]/50" />
        )}
      </button>
      {open && (
        <p className="pb-4 text-[#1E1B4B]/70 text-sm leading-relaxed">
          {answer}
        </p>
      )}
    </div>
  );
}

function ArticlePage() {
  const { article } = Route.useLoaderData();
  const siteUrl =
    typeof window !== "undefined" ? window.location.origin : "https://orgcomms.app";
  const articleUrl = `${siteUrl}/articles/${article.slug}`;

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
              to="/articles/"
              className="flex items-center gap-1.5 text-sm font-medium text-[#1E1B4B]/70 hover:text-[#6366F1] transition-colors"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              All Articles
            </Link>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="px-4 pt-6 pb-0 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <nav className="flex items-center gap-2 text-xs text-[#1E1B4B]/50">
            <Link to="/" className="hover:text-[#6366F1] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              to="/articles/"
              className="hover:text-[#6366F1] transition-colors"
            >
              Articles
            </Link>
            <span>/</span>
            <span className="text-[#1E1B4B]/80 truncate max-w-[200px]">
              {article.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Article */}
      <article className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <header className="mb-10">
            <Badge
              variant="secondary"
              className="bg-[#6366F1]/10 text-[#6366F1] hover:bg-[#6366F1]/15 font-medium text-xs mb-5"
            >
              {article.category}
            </Badge>

            <h1 className="text-3xl font-extrabold tracking-tight text-[#1E1B4B] sm:text-4xl leading-tight mb-5">
              {article.title}
            </h1>

            <p className="text-lg text-[#1E1B4B]/70 leading-relaxed mb-6">
              {article.intro}
            </p>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#1E1B4B]/50 pb-6 border-b border-[#6366F1]/10">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {article.readingTime}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(article.publishedAt)}
              </span>
              {article.tags.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Tag className="h-4 w-4" />
                  <div className="flex flex-wrap gap-1.5">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#6366F1]/8 px-2 py-0.5 text-xs font-medium text-[#6366F1]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Body Sections */}
          <div className="space-y-10 mb-14">
            {article.sections.map((section, i) => (
              <section key={i}>
                <h2 className="text-xl font-bold text-[#1E1B4B] mb-3 leading-snug">
                  {section.heading}
                </h2>
                <p className="text-[#1E1B4B]/70 leading-relaxed text-base">
                  {section.content}
                </p>
                {section.list && section.list.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {section.list.map((item, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-3 text-[#1E1B4B]/70 text-sm"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6366F1]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {/* HowTo Section */}
          {article.howTo && (
            <section className="mb-14">
              <div className="rounded-2xl bg-white border border-[#6366F1]/10 p-6 shadow-sm">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#6366F1]/10 px-3 py-1 text-xs font-semibold text-[#6366F1] mb-4">
                  Step-by-Step Guide
                </div>
                <h2 className="text-xl font-bold text-[#1E1B4B] mb-6">
                  {article.howTo.name}
                </h2>
                <ol className="space-y-5">
                  {article.howTo.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#6366F1] text-xs font-bold text-white mt-0.5">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-[#1E1B4B] text-sm mb-0.5">
                          {step.name}
                        </p>
                        <p className="text-[#1E1B4B]/60 text-sm leading-relaxed">
                          {step.text}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          )}

          {/* FAQ Section */}
          {article.faqs.length > 0 && (
            <section className="mb-14">
              <h2 className="text-2xl font-bold text-[#1E1B4B] mb-6">
                Frequently Asked Questions
              </h2>
              <div className="rounded-2xl bg-white border border-[#6366F1]/10 px-6 shadow-sm divide-y-0">
                {article.faqs.map((faq, i) => (
                  <FaqItem
                    key={i}
                    question={faq.question}
                    answer={faq.answer}
                  />
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#818CF8] p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-3">
              Ready to transform your organisation's communications?
            </h2>
            <p className="text-white/80 mb-6 max-w-lg mx-auto text-sm leading-relaxed">
              Start sending targeted messages, push notifications, and event
              updates to your team — all from one simple platform.
            </p>
            <Button
              size="lg"
              className="bg-white text-[#6366F1] hover:bg-white/90 font-semibold"
            >
              <Link to="/sign-up" className="flex items-center gap-2">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </section>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-[#6366F1]/10 px-4 py-8 sm:px-6 lg:px-8 bg-white/50 mt-10">
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

      {/* Structured Data */}
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteUrl },
          { name: "Articles", url: `${siteUrl}/articles` },
          { name: article.title, url: articleUrl },
        ]}
      />
      <ArticleJsonLd
        title={article.metaTitle}
        description={article.metaDescription}
        url={articleUrl}
        publishedAt={article.publishedAt}
        updatedAt={article.updatedAt}
        publisherName="Org Comms"
      />
      {article.faqs.length > 0 && <FAQJsonLd faqs={article.faqs} />}
      {article.howTo && (
        <HowToJsonLd
          name={article.howTo.name}
          description={article.metaDescription}
          steps={article.howTo.steps}
        />
      )}
    </div>
  );
}
