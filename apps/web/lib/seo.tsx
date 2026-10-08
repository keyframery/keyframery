/* Search and social metadata, and the structured data (JSON-LD) that search and AI engines read. */

import type { Metadata } from "next"

export const SITE = "https://keyframery.com"
export const SITE_NAME = "Keyframery"
/** One description everywhere (site, GitHub, directories), so engines learn one consistent entity. */
export const TAGLINE = "Keyframery is an open-source motion layer for shadcn/ui."
export const REPO = "https://github.com/keyframery/keyframery"
const MAKER = { "@type": "Person", name: "Briyan Hingrajiya", url: "https://x.com/briyan_dev" }
const ORG_ID = `${SITE}/#organization`
const WEBSITE_ID = `${SITE}/#website`

export const url = (path: string) => `${SITE}${path === "/" ? "" : path}`

/** The site's social image (app/opengraph-image.tsx). A page that sets its own openGraph loses the inherited one, so it's named here. */
const SITE_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: "Keyframery: add one line, and your shadcn/ui app animates" }

/**
 * Title, description, canonical URL and social tags for one page. A page's openGraph replaces the layout's whole,
 * so it is built complete here, image included. `title` gets " | Keyframery" from the layout's template; `absolute` doesn't.
 */
export function pageMetadata({ title, absolute, description, path, image }: { title?: string; absolute?: string; description: string; path: string; image?: string }): Metadata {
  const shown = absolute ?? `${title} | ${SITE_NAME}`
  const images = { images: image ? { url: image, width: 1200, height: 630, alt: shown } : SITE_IMAGE }
  return {
    title: absolute ? { absolute } : title,
    description,
    alternates: { canonical: url(path) },
    openGraph: { type: "website", siteName: SITE_NAME, url: url(path), title: shown, description, ...images },
    twitter: { card: "summary_large_image", title: shown, description, ...images },
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
    { "@type": "Organization", "@id": ORG_ID, name: SITE_NAME, url: SITE, logo: `${SITE}/apple-icon.png`, sameAs: [REPO], founder: MAKER },
    { "@type": "WebSite", "@id": WEBSITE_ID, name: SITE_NAME, url: SITE, description: TAGLINE, inLanguage: "en", publisher: { "@id": ORG_ID } },
  )

/** On the home page: the project itself. */
export const projectData = (description: string) =>
  graph({
    "@type": "SoftwareSourceCode",
    name: SITE_NAME,
    description,
    url: SITE,
    codeRepository: REPO,
    programmingLanguage: ["TypeScript", "React"],
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

/** On each docs page: the article and where it sits. */
export const docData = ({ path, headline, description, image }: { path: string; headline: string; description: string; image: string }) =>
  graph(
    {
      "@type": "TechArticle",
      headline,
      description,
      url: url(path),
      mainEntityOfPage: url(path),
      image,
      inLanguage: "en",
      author: MAKER,
      publisher: { "@id": ORG_ID },
      isPartOf: { "@id": WEBSITE_ID },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { name: SITE_NAME, item: SITE },
        { name: "Docs", item: url("/docs") },
        ...(path === "/docs" ? [] : [{ name: headline, item: url(path) }]),
      ].map((c, i) => ({ "@type": "ListItem", position: i + 1, ...c })),
    },
  )
