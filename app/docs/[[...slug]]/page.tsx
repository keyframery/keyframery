import { findNeighbour } from "fumadocs-core/page-tree"
import { DocsBody, DocsDescription, DocsPage, DocsTitle, MarkdownCopyButton, ViewOptionsPopover } from "fumadocs-ui/layouts/docs/page"
import { createRelativeLink } from "fumadocs-ui/mdx"
import { ArrowLeft, ArrowRight } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { PageChips } from "@site/components/docs/page-chips"
import { getMDXComponents } from "@site/components/mdx"
import { lastChanged } from "@site/lib/dates"
import { breadcrumbData, docData, faqData, JsonLd, pageMetadata } from "@site/lib/seo"
import { getPageMarkdownUrl, gitConfig, url } from "@site/lib/shared"
import { source } from "@site/lib/source"

type Props = { params: Promise<{ slug?: string[] }> }

/** `code` in a FAQ answer, as inline code. */
function inline(text: string) {
  return text.split(/`([^`]+)`/).map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part))
}

export default async function Page(props: Props) {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  const MDX = page.data.body
  const markdownUrl = getPageMarkdownUrl(page).url
  const heading = page.data.heading ?? page.data.title
  const faq = page.data.faq ?? []
  const toc = faq.length ? [...page.data.toc, { title: "Questions", url: "#questions", depth: 2 }] : page.data.toc
  const { previous, next } = findNeighbour(source.getPageTree(), page.url)
  const component = page.data.component
  // Component pages are generated from the component's source, so "edit this page" points there.
  const githubPath = component ? `src/components/ui/${component}.tsx` : `content/docs/${page.path}`

  return (
    <DocsPage toc={toc} full={page.data.full}>
      <JsonLd data={docData({ path: page.url, headline: heading, description: page.data.description ?? "", dateModified: lastChanged(page.url), image: `/og/docs/${[...page.slugs, "image.png"].join("/")}` })} />
      <JsonLd
        data={breadcrumbData([
          { name: "Keyframery", path: "/" },
          { name: "Docs", path: "/docs" },
          ...(component ? [{ name: "Components", path: "/docs/components" }] : []),
          ...(page.url !== "/docs" ? [{ name: page.data.title, path: page.url }] : []),
        ])}
      />
      {faq.length > 0 && <JsonLd data={faqData(faq.map(({ q, a }) => ({ q, text: a.replaceAll("`", "") })))} />}
      {/* The title row: the page's name, then what you can do with the page and where to go next. */}
      <header className="grid gap-4">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <DocsTitle className="min-w-0 text-[32px] leading-[1.15] tracking-[-0.025em] text-balance">{heading}</DocsTitle>
          <div className="flex items-center gap-1.5 md:pt-1">
            <MarkdownCopyButton markdownUrl={markdownUrl} />
            <ViewOptionsPopover markdownUrl={markdownUrl} githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/${githubPath}`} />
            {[
              { item: previous, label: "Previous", Icon: ArrowLeft },
              { item: next, label: "Next", Icon: ArrowRight },
            ].map(({ item, label, Icon }) =>
              item ? (
                <Link
                  key={label}
                  href={item.url}
                  aria-label={`${label}: ${typeof item.name === "string" ? item.name : ""}`.trim()}
                  className="grid size-8 place-items-center rounded-md border bg-fd-secondary text-fd-secondary-foreground outline-none hover:bg-fd-accent focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon aria-hidden="true" className="size-3.5" />
                </Link>
              ) : null,
            )}
          </div>
        </div>
        <DocsDescription className="mb-0 max-w-[68ch] text-[17px] leading-relaxed text-pretty">{page.data.description}</DocsDescription>
        {/* Says what Keyframery is on every page, so a passage quoted on its own still names the product. */}
        <p className="-mt-2 text-sm text-fd-muted-foreground">Part of Keyframery, the open-source animated components for UI SDK</p>
        {component && <PageChips slug={component} />}
      </header>
      <DocsBody>
        <MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} />
        {faq.length > 0 && (
          <section aria-labelledby="questions">
            <h2 id="questions">Questions</h2>
            {faq.map(({ q, a }) => (
              <div key={q}>
                <h3>{q}</h3>
                <p>{inline(a)}</p>
              </div>
            ))}
          </section>
        )}
      </DocsBody>
    </DocsPage>
  )
}

export function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()
  const component = page.data.component
  const metadata = pageMetadata({
    // Component pages lead with what people search for: an animated <component> for UI SDK.
    title: page.data.seoTitle ?? (component ? `Animated ${page.data.title} for UI SDK` : page.data.title),
    description: component ? `Animated ${page.data.title.toLowerCase()} for UI SDK, in plain CSS. ${page.data.description ?? ""}`.slice(0, 160) : (page.data.description ?? ""),
    path: page.url,
    image: `/og/docs/${[...page.slugs, "image.png"].join("/")}`,
  })
  // The same page as Markdown, for AI tools that look for it.
  return { ...metadata, alternates: { ...metadata.alternates, types: { "text/markdown": `${url(page.url)}.mdx` } } }
}
