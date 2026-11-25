import { findNeighbour } from "fumadocs-core/page-tree"
import { DocsBody, DocsDescription, DocsPage, DocsTitle, MarkdownCopyButton, ViewOptionsPopover } from "fumadocs-ui/layouts/docs/page"
import { createRelativeLink } from "fumadocs-ui/mdx"
import { ArrowLeft, ArrowRight } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { PageChips } from "@site/components/docs/page-chips"
import { TemplateActions } from "@site/components/templates/template-actions"
import { entries, entry } from "@site/lib/catalog"
import { getMDXComponents } from "@site/components/mdx"
import { firstPublished, lastChanged } from "@site/lib/dates"
import { getDocsNavigation } from "@site/lib/docs-navigation"
import { breadcrumbData, docData, faqData, JsonLd, pageMetadata } from "@site/lib/seo"
import { getPageMarkdownUrl, gitConfig, url } from "@site/lib/shared"
import { source } from "@site/lib/source"
import { template as findTemplate } from "@site/lib/templates"

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
  const sections = page.data.component
    ? [{ title: "Preview", url: "#preview", depth: 2 }, { title: "Customize", url: "#customize", depth: 2 }, ...page.data.toc]
    : page.data.toc
  const toc = faq.length ? [...sections, { title: "Questions", url: "#questions", depth: 2 }] : sections
  const { previous, next } = findNeighbour(getDocsNavigation(), page.url)
  const component = page.data.component
  const current = component ? entry(component) : undefined
  const template = page.data.template ? findTemplate(page.data.template) : undefined
  const related = current ? entries.filter((candidate) => candidate.slug !== current.slug && candidate.group === current.group).slice(0, 3) : []
  // Component pages are generated from the component's source, so "edit this page" points there.
  const githubPath = component ? `src/components/ui/${component}.tsx` : template ? `src/templates/${template.slug}/${template.slug}.tsx` : `content/docs/${page.path}`
  // What you can do with the page, then where to go next.
  const actions = (
    <>
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
    </>
  )

  return (
    <DocsPage toc={toc} full={page.data.full} data-component={component} className={component || template ? "max-w-none" : undefined} breadcrumb={{ enabled: !component && !template }}>
      <JsonLd data={docData({ path: page.url, headline: heading, description: page.data.description ?? "", datePublished: firstPublished(page.url), dateModified: lastChanged(page.url), image: `/og/docs/${[...page.slugs, "image.png"].join("/")}` })} />
      <JsonLd
        data={breadcrumbData([
          { name: "Keyframery", path: "/" },
          { name: "Docs", path: "/docs" },
          ...(component ? [{ name: "Components", path: "/docs/components" }] : []),
          ...(template ? [{ name: "Templates", path: "/docs/templates" }] : []),
          ...(page.url !== "/docs" ? [{ name: page.data.title, path: page.url }] : []),
        ])}
      />
      {faq.length > 0 && <JsonLd data={faqData(faq.map(({ q, a }) => ({ q, text: a.replaceAll("`", "") })))} />}
      {/* The title row: the page's name, then what you can do with the page and where to go next. */}
      <header className="kf-doc-header grid gap-2.5">
        {component && (
          <nav aria-label="Component breadcrumb" className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Link href="/docs/components" className="rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">Components</Link>
            <span aria-hidden="true">/</span>
            <span>{current?.group ?? page.data.title}</span>
          </nav>
        )}
        {template && (
          <nav aria-label="Template breadcrumb" className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Link href="/docs/templates" className="rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">Templates</Link>
            <span aria-hidden="true">/</span>
            <span>{template.kind}</span>
          </nav>
        )}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <DocsTitle className="flex min-w-0 items-center gap-2.5 text-[30px] leading-9 font-semibold tracking-[-0.025em] text-balance">
            {component || template ? page.data.title : heading}
            {template && <span className="rounded-full border px-2 py-0.5 text-[11px] leading-4 font-medium tracking-normal text-muted-foreground">{template.price}</span>}
          </DocsTitle>
          {/* One control on every docs page: the outer parent is the tray, the inner parent the bar the actions sit on (see .kf-actions in globals.css). */}
          <div className="kf-actions">
            <div className="kf-actions-bar">{actions}</div>
          </div>
        </div>
        <DocsDescription className="mb-0 max-w-[68ch] text-[15px] leading-6 text-pretty">{page.data.description}</DocsDescription>
        {component && <PageChips slug={component} />}
        {template && (
          <div className="mt-2 grid gap-3">
            <TemplateActions slug={template.slug} />
            <ul aria-label="At a glance" className="not-prose flex flex-wrap gap-x-4 gap-y-1 text-[11px] leading-5 text-muted-foreground">
              {template.facts.slice(1).map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          </div>
        )}
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
        {related.length > 0 && (
          <section aria-labelledby="related-components" className="not-prose mt-14 border-t pt-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="related-components" className="text-[16px] font-semibold tracking-tight">More in {current?.group}</h2>
              <Link href="/docs/components" className="inline-flex items-center gap-1 text-[12px] text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">All components <ArrowRight aria-hidden="true" className="size-3" /></Link>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {related.map((candidate) => (
                <Link key={candidate.slug} href={`/docs/components/${candidate.slug}`} className="rounded-xl border p-4 outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="text-[13px] font-medium">{candidate.name}</span>
                  <span className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">{candidate.description}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </DocsBody>
    </DocsPage>
  )
}

export function generateStaticParams() {
  return source.generateParams()
}

/** Google shows about 60 characters of a title, " | Keyframery" included. */
function componentTitle(name: string, forSdk: string) {
  const full = `Animated React ${name}${forSdk}`
  return full.length + " | Keyframery".length <= 60 ? full : `Animated ${name}${forSdk}`
}

/**
 * "<Name> component for Vercel's UI SDK, animated in plain CSS." plus the page's motion line, kept under
 * 160 characters. A long motion line is cut at its last full sentence or clause that fits, never mid-word.
 */
function componentDescription(name: string, forSdk: string, motion: string) {
  const lead = forSdk ? `${name} component for Vercel's UI SDK, animated in plain CSS.` : `Animated React ${name.toLowerCase()} component, in plain CSS.`
  const max = 160
  let text = `${lead} ${motion}`.trim()
  const install = " Install it with one shadcn command."
  if (text.length + install.length <= max) return text + install
  if (text.length <= max) return text
  const room = text.slice(0, max - 1)
  const stop = Math.max(room.lastIndexOf(". "), room.lastIndexOf(", "), room.lastIndexOf("; "))
  if (stop > lead.length + 40) return room.slice(0, stop).replace(/[,;]$/, "") + "."
  text = room.slice(0, room.lastIndexOf(" ")).replace(/[,;:]$/, "")
  return `${text}…`
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()
  const component = page.data.component
  // "for UI SDK" when the component wraps a UI SDK part or is defined on UI SDK's core.
  const built = component ? entry(component) : undefined
  const forSdk = built?.sdk || built?.core ? " for UI SDK" : ""
  const metadata = pageMetadata({
    // Component pages lead with what people search for: an animated <component> for UI SDK.
    // "React" next to "UI SDK": several other products are also called a UI SDK.
    title: page.data.seoTitle ?? (component ? componentTitle(page.data.title, forSdk) : page.data.title),
    description: component ? componentDescription(page.data.title, forSdk, page.data.seoDescription ?? page.data.description ?? "") : (page.data.description ?? ""),
    path: page.url,
    image: `/og/docs/${[...page.slugs, "image.png"].join("/")}`,
  })
  // The same page as Markdown, for AI tools that look for it.
  return { ...metadata, alternates: { ...metadata.alternates, types: { "text/markdown": `${url(page.url)}.mdx` } } }
}
