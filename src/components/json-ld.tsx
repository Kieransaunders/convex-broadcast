type JsonLdData = Record<string, unknown>;

function JsonLd({ data }: { data: JsonLdData }) {
  let json: string;
  try {
    json = JSON.stringify(data);
  } catch {
    return null;
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

interface OrganizationProps {
  name: string;
  url: string;
  description: string;
  logo?: string;
}

function OrganizationJsonLd({ name, url, description, logo }: OrganizationProps) {
  const data: JsonLdData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    description,
    ...(logo ? { logo } : {}),
  };
  return <JsonLd data={data} />;
}

function WebSiteJsonLd({ name, url }: { name: string; url: string }) {
  const data: JsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
  return <JsonLd data={data} />;
}

interface ArticleProps {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  updatedAt: string;
  authorName?: string;
  publisherName: string;
  publisherLogo?: string;
  imageUrl?: string;
}

function ArticleJsonLd({
  title,
  description,
  url,
  publishedAt,
  updatedAt,
  authorName,
  publisherName,
  publisherLogo,
  imageUrl,
}: ArticleProps) {
  const data: JsonLdData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    datePublished: publishedAt,
    dateModified: updatedAt,
    ...(authorName
      ? { author: { "@type": "Person", name: authorName } }
      : {}),
    publisher: {
      "@type": "Organization",
      name: publisherName,
      ...(publisherLogo
        ? { logo: { "@type": "ImageObject", url: publisherLogo } }
        : {}),
    },
    ...(imageUrl ? { image: imageUrl } : {}),
  };
  return <JsonLd data={data} />;
}

interface FAQProps {
  faqs: Array<{ question: string; answer: string }>;
}

function FAQJsonLd({ faqs }: FAQProps) {
  const data: JsonLdData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
  return <JsonLd data={data} />;
}

interface HowToProps {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string }>;
}

function HowToJsonLd({ name, description, steps }: HowToProps) {
  const data: JsonLdData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    step: steps.map(({ name: stepName, text }, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: stepName,
      text,
    })),
  };
  return <JsonLd data={data} />;
}

interface BreadcrumbProps {
  items: Array<{ name: string; url: string }>;
}

function BreadcrumbJsonLd({ items }: BreadcrumbProps) {
  const data: JsonLdData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(({ name, url }, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item: url,
    })),
  };
  return <JsonLd data={data} />;
}

export {
  JsonLd,
  OrganizationJsonLd,
  WebSiteJsonLd,
  ArticleJsonLd,
  FAQJsonLd,
  HowToJsonLd,
  BreadcrumbJsonLd,
};
