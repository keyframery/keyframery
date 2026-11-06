/* Search and social metadata, and the structured data (JSON-LD) that search and AI engines read. */

import type { Metadata } from "next"

export const SITE = "https://keyframery.com"
export const SITE_NAME = "Keyframery"
/** One description everywhere (site, GitHub, directories), so engines learn one consistent entity. */
export const TAGLINE = "Keyframery is an open-source motion layer for shadcn/ui."
export const REPO = "https://github.com/keyframery/keyframery"
/** The maker, with the same @id as the Person on his author page, so engines see one person everywhere. */
const MAKER_PAGE = `${SITE}/authors/briyan-hingrajiya`
const MAKER = { "@type": "Person", "@id": `${MAKER_PAGE}#person`, name: "Briyan Hingrajiya", url: MAKER_PAGE, sameAs: ["https://x.com/briyan_dev", "https://github.com/BriyanPatel"] }

/** A day from frontmatter as a full timestamp (09:00 in Ahmedabad), which Google prefers to a bare date. */
export const isoTime = (day: string) => `${day}T09:00:00+05:30`
const ORG_ID = `${SITE}/#organization`
const WEBSITE_ID = `${SITE}/#website`

export const url = (path: string) => `${SITE}${path === "/" ? "" : path}`

/** The site's social image (app/opengraph-image.tsx). A page that sets its own openGraph loses the inherited one, so it's named here. */
const SITE_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: "Keyframery: add one line, and your shadcn/ui app animates" }

/**
 * Title, description, canonical URL and social tags for one page. A page's openGraph replaces the layout's whole,
 * so it is built complete here, image included. `title` gets " | Keyframery" from the layout's template; `absolute` doesn't.
 */
export function pageMetadata({
  title,
  absolute,
  description,
  path,
  image,
  markdown,
  article,
  imageAlt,
}: {
  title?: string
  absolute?: string
  description: string
  path: string
  image?: string
  /** This page as Markdown, for AI agents. */
  markdown?: string
  /** A blog post: its social card says article, with its dates, author page and tags. */
  article?: { published: string; updated?: string; authorUrl: string; tags: string[] }
  /** What the social image shows, for people who can't see it. Defaults to the page title. */
  imageAlt?: string
}): Metadata {
  const shown = absolute ?? `${title} | ${SITE_NAME}`
  const images = { images: image ? { url: image, width: 1200, height: 630, alt: imageAlt ?? shown } : SITE_IMAGE }
  const og = article
    ? { type: "article" as const, publishedTime: isoTime(article.published), modifiedTime: isoTime(article.updated ?? article.published), authors: [article.authorUrl], tags: article.tags }
    : { type: "website" as const }
  return {
    title: absolute ? { absolute } : title,
    description,
    alternates: { canonical: url(path), ...(markdown ? { types: { "text/markdown": url(markdown) } } : {}) },
    openGraph: { ...og, siteName: SITE_NAME, url: url(path), title: shown, description, ...images },
    // A page's twitter object replaces the layout's whole, so the creator is repeated here.
    twitter: { card: "summary_large_image", creator: "@briyan_dev", title: shown, description, ...images },
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
      foundingDate: "2026-10",
      logo: { "@type": "ImageObject", url: `${SITE}/apple-icon.png`, width: 180, height: 180 },
      sameAs: [REPO, "https://github.com/keyframery"],
      founder: MAKER,
      contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: "briyan@keyframery.com", availableLanguage: "en" },
    },
    { "@type": "WebSite", "@id": WEBSITE_ID, name: SITE_NAME, alternateName: "Keyframery motion layer for shadcn/ui", url: SITE, description: TAGLINE, inLanguage: "en", publisher: { "@id": ORG_ID } },
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
    // React is a library, not a language; the runtime is the browser.
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

type Author = { name: string; slug: string; sameAs: string[]; role: string; bio: string; knowsAbout: string[]; image?: string; homeLocation?: string }
const authorUrl = (a: Author) => url(`/authors/${a.slug}`)
/** One Person per author, with a stable @id on their page, so every post and the profile describe the same entity. */
const person = (a: Author) => ({
  "@type": "Person",
  "@id": `${authorUrl(a)}#person`,
  name: a.name,
  url: authorUrl(a),
  sameAs: a.sameAs,
  jobTitle: a.role,
  description: a.bio,
  knowsAbout: a.knowsAbout,
  worksFor: { "@id": ORG_ID },
  ...(a.homeLocation ? { homeLocation: { "@type": "Place", name: a.homeLocation } } : {}),
  ...(a.image ? { image: `${SITE}${a.image}` } : {}),
})

/** On an author's page: the profile and who it's about. */
export const authorPageData = (a: Author, posts: { path: string; headline: string }[]) =>
  graph(
    {
      "@type": "ProfilePage",
      "@id": `${authorUrl(a)}#page`,
      url: authorUrl(a),
      name: `${a.name} | ${SITE_NAME}`,
      inLanguage: "en",
      isPartOf: { "@id": WEBSITE_ID },
      mainEntity: { "@id": `${authorUrl(a)}#person` },
      hasPart: posts.map((p) => ({ "@id": `${url(p.path)}#article` })),
    },
    person(a),
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { name: SITE_NAME, item: SITE },
        { name: "Blog", item: url("/blog") },
        { name: a.name, item: authorUrl(a) },
      ].map((c, i) => ({ "@type": "ListItem", position: i + 1, ...c })),
    },
  )

/** On a blog post: the article (with its dates, length and short answer), who wrote it, and where it sits. */
export const blogPostData = (p: {
  path: string
  headline: string
  description: string
  image: string
  published: string
  updated?: string
  author: Author
  words: number
  minutes: number
  tldr: string[]
  tags: string[]
  sources: { title: string; url: string }[]
  about: string[]
}) =>
  graph(
    {
      "@type": "BlogPosting",
      "@id": `${url(p.path)}#article`,
      headline: p.headline,
      description: p.description,
      abstract: p.tldr.join(" "),
      url: url(p.path),
      mainEntityOfPage: { "@type": "WebPage", "@id": url(p.path) },
      image: { "@type": "ImageObject", url: p.image, width: 1200, height: 630 },
      datePublished: isoTime(p.published),
      dateModified: isoTime(p.updated ?? p.published),
      wordCount: p.words,
      timeRequired: `PT${p.minutes}M`,
      keywords: p.tags.join(", "),
      inLanguage: "en",
      author: person(p.author),
      publisher: { "@id": ORG_ID },
      isPartOf: { "@type": "Blog", "@id": `${SITE}/blog#blog` },
      about: p.about.map((name) => ({ "@type": "Thing", name })),
      mentions: [{ "@type": "SoftwareSourceCode", "@id": `${SITE}/#software`, name: SITE_NAME, url: SITE, codeRepository: REPO }],
      ...(p.sources.length ? { citation: p.sources.map((s) => ({ "@type": "CreativeWork", name: s.title, url: s.url })) } : {}),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { name: SITE_NAME, item: SITE },
        { name: "Blog", item: url("/blog") },
        { name: p.headline, item: url(p.path) },
      ].map((c, i) => ({ "@type": "ListItem", position: i + 1, ...c })),
    },
  )

/** On the blog's index: the blog and its posts. */
export const blogIndexData = (posts: { path: string; headline: string; published: string; updated?: string }[]) =>
  graph(
    {
      "@type": "Blog",
      "@id": `${SITE}/blog#blog`,
      name: `${SITE_NAME} blog`,
      url: url("/blog"),
      inLanguage: "en",
      publisher: { "@id": ORG_ID },
      isPartOf: { "@id": WEBSITE_ID },
      blogPost: posts.map((p) => ({
        "@type": "BlogPosting",
        "@id": `${url(p.path)}#article`,
        headline: p.headline,
        url: url(p.path),
        datePublished: isoTime(p.published),
        dateModified: isoTime(p.updated ?? p.published),
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { name: SITE_NAME, item: SITE },
        { name: "Blog", item: url("/blog") },
      ].map((c, i) => ({ "@type": "ListItem", position: i + 1, ...c })),
    },
  )

/** On /cuts: a guide to the transition patterns, with live examples. */
export const cutsPageData = (description: string) =>
  graph(
    {
      "@type": "Article",
      "@id": `${url("/cuts")}#article`,
      headline: "shadcn/ui animation examples",
      description,
      url: url("/cuts"),
      mainEntityOfPage: url("/cuts"),
      image: `${SITE}/opengraph-image`,
      inLanguage: "en",
      about: { "@id": `${SITE}/#software` },
      author: MAKER,
      publisher: { "@id": ORG_ID },
      isPartOf: { "@id": WEBSITE_ID },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { name: SITE_NAME, item: SITE },
        { name: "Examples", item: url("/cuts") },
      ].map((x, i) => ({ "@type": "ListItem", position: i + 1, ...x })),
    },
  )

/** On /about: the page describes the organization and its maker. */
export const aboutPageData = () =>
  graph(
    {
      "@type": "AboutPage",
      "@id": `${url("/about")}#page`,
      url: url("/about"),
      name: `About ${SITE_NAME}`,
      inLanguage: "en",
      isPartOf: { "@id": WEBSITE_ID },
      mainEntity: { "@id": ORG_ID },
      about: { "@id": ORG_ID },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { name: SITE_NAME, item: SITE },
        { name: "About", item: url("/about") },
      ].map((x, i) => ({ "@type": "ListItem", position: i + 1, ...x })),
    },
  )

/** On a /ui component page: the component's source (installed with the shadcn CLI), and where it sits. */
export const uiComponentData = (c: { slug: string; name: string; description: string; seoTitle: string }) =>
  graph(
    {
      "@type": "SoftwareSourceCode",
      "@id": `${url(`/ui/${c.slug}`)}#component`,
      name: c.name,
      description: c.description,
      url: url(`/ui/${c.slug}`),
      codeRepository: REPO,
      programmingLanguage: "TypeScript",
      runtimePlatform: "Browser",
      license: "https://opensource.org/licenses/MIT",
      isAccessibleForFree: true,
      author: MAKER,
      publisher: { "@id": ORG_ID },
      isPartOf: { "@id": WEBSITE_ID },
    },
    // The page itself is documentation about the component: install, props, accessibility.
    {
      "@type": "Article",
      "@id": `${url(`/ui/${c.slug}`)}#article`,
      headline: c.seoTitle,
      description: c.description,
      url: url(`/ui/${c.slug}`),
      mainEntityOfPage: url(`/ui/${c.slug}`),
      image: `${SITE}/opengraph-image`,
      inLanguage: "en",
      about: { "@id": `${url(`/ui/${c.slug}`)}#component` },
      author: MAKER,
      publisher: { "@id": ORG_ID },
      isPartOf: { "@id": WEBSITE_ID },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { name: SITE_NAME, item: SITE },
        { name: "Components", item: url("/ui") },
        { name: c.name, item: url(`/ui/${c.slug}`) },
      ].map((x, i) => ({ "@type": "ListItem", position: i + 1, ...x })),
    },
  )

/** On /ui: the collection of components. */
export const uiIndexData = (items: { slug: string; name: string }[]) =>
  graph(
    {
      "@type": "CollectionPage",
      "@id": `${url("/ui")}#page`,
      name: `Animated components for shadcn/ui | ${SITE_NAME}`,
      url: url("/ui"),
      isPartOf: { "@id": WEBSITE_ID },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, url: url(`/ui/${c.slug}`) })),
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { name: SITE_NAME, item: SITE },
        { name: "Components", item: url("/ui") },
      ].map((x, i) => ({ "@type": "ListItem", position: i + 1, ...x })),
    },
  )

/** On each docs page: the article and where it sits. Article, not TechArticle: it's the type Google's Article results read. */
export const docData = ({ path, headline, description, image, published, modified }: { path: string; headline: string; description: string; image: string; published?: string; modified?: string }) =>
  graph(
    {
      "@type": "Article",
      "@id": `${url(path)}#article`,
      ...(published ? { datePublished: isoTime(published) } : {}),
      ...(modified ? { dateModified: isoTime(modified) } : {}),
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
