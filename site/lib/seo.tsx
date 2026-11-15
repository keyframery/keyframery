/* Search and social metadata, and the structured data (JSON-LD) that search and AI engines read. */

import type { Metadata } from "next"

import { REPO, SITE, SITE_NAME, TAGLINE, url } from "./shared"

const MAKER = { "@type": "Person", "@id": `${SITE}/#maker`, name: "Briyan Hingrajiya", sameAs: ["https://x.com/briyan_dev", "https://github.com/BriyanPatel"] }
const ORG_ID = `${SITE}/#organization`
const WEBSITE_ID = `${SITE}/#website`

/** The site's social image (app/opengraph-image.tsx). A page that sets its own openGraph loses the inherited one, so it's named here. */
const SITE_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: "Keyframery: animated components for UI SDK" }

/**
 * Title, description, canonical URL and social tags for one page. A page's openGraph replaces the layout's whole,
 * so it is built complete here. `title` gets " | Keyframery" from the layout's template; `absolute` doesn't.
 */
export function pageMetadata({
  title,
  absolute,
  description,
  path,
  markdown,
  image,
}: {
  title?: string
  absolute?: string
  description: string
  path: string
  markdown?: string
  /** This page's own social image; the site image otherwise. */
  image?: string
}): Metadata {
  const shown = absolute ?? `${title} | ${SITE_NAME}`
  const images = image ? { url: image, width: 1200, height: 630, alt: shown } : SITE_IMAGE
  return {
    title: absolute ? { absolute } : title,
    description,
    alternates: { canonical: url(path), ...(markdown ? { types: { "text/markdown": url(markdown) } } : {}) },
    openGraph: { type: "website", siteName: SITE_NAME, url: url(path), title: shown, description, images },
    twitter: { card: "summary_large_image", creator: "@briyan_dev", title: shown, description, images },
  }
}

export function JsonLd({ data }: { data: object }) {
  // "<" escaped so text in the data can't close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
}

const graph = (...nodes: object[]) => ({ "@context": "https://schema.org", "@graph": nodes })

/** On every page: who publishes the site. */
export const siteData = () =>
  graph(
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: SITE_NAME,
      url: SITE,
      description: TAGLINE,
      logo: { "@type": "ImageObject", url: `${SITE}/apple-icon.png`, width: 180, height: 180 },
      sameAs: [REPO, "https://github.com/keyframery"],
      founder: MAKER,
      contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: "briyan@keyframery.com", availableLanguage: "en" },
    },
    { "@type": "WebSite", "@id": WEBSITE_ID, name: SITE_NAME, alternateName: "Keyframery UI", url: SITE, description: TAGLINE, inLanguage: "en", publisher: { "@id": ORG_ID } },
  )

/** On the home page: the project itself. */
export const projectData = (description: string) =>
  graph({
    "@type": "SoftwareSourceCode",
    "@id": `${SITE}/#software`,
    name: SITE_NAME,
    description,
    url: SITE,
    codeRepository: REPO,
    mainEntityOfPage: SITE,
    isPartOf: { "@id": WEBSITE_ID },
    programmingLanguage: "TypeScript",
    runtimePlatform: "Browser",
    license: "https://opensource.org/licenses/MIT",
    author: MAKER,
    publisher: { "@id": ORG_ID },
  })

export const faqData = (questions: { q: string; text: string }[]) =>
  graph({
    "@type": "FAQPage",
    mainEntity: questions.map(({ q, text }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text } })),
  })

/** Home > Docs > (Components >) page, for the search result's breadcrumb trail. */
export const breadcrumbData = (trail: { name: string; path: string }[]) =>
  graph({
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: url(t.path) })),
  })

/** On a docs page. */
export const docData = ({ path, headline, description }: { path: string; headline: string; description: string }) =>
  graph({
    "@type": "TechArticle",
    "@id": `${url(path)}#article`,
    headline,
    description,
    url: url(path),
    mainEntityOfPage: url(path),
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
    author: MAKER,
    publisher: { "@id": ORG_ID },
  })
