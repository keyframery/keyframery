import fs from "node:fs/promises"
import path from "node:path"

import { highlight } from "fumadocs-core/highlight"
import { DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/docs/page"
import { ArrowLeft, ArrowRight } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CodeBlock, InstallTabs, PreviewTabs } from "@/components/ui-library/blocks"
import { Demo } from "@/components/ui-library/demos"
import { Tag } from "@/components/ui-library/tag"
import { pageMetadata } from "@/lib/seo"
import { UI_ORDER, uiComponent } from "@/lib/ui-library"

export const dynamicParams = false

// Only components you can use today get a page; the rest wait under Coming next on /ui.
export function generateStaticParams() {
  return UI_ORDER.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata(props: PageProps<"/ui/[slug]">): Promise<Metadata> {
  const c = uiComponent((await props.params).slug)
  if (!c) notFound()
  return pageMetadata({ title: c.seoTitle, description: c.description, path: `/ui/${c.slug}` })
}

const TOC = [
  { title: "Preview", url: "#preview", depth: 2 },
  { title: "Installation", url: "#installation", depth: 2 },
  { title: "Props", url: "#props", depth: 2 },
  { title: "Accessibility and motion", url: "#accessibility", depth: 2 },
]

// Shiki at build time with the high-contrast GitHub themes, like the rest of the site.
const code = (source: string) =>
  highlight(source, {
    lang: "tsx",
    themes: { light: "github-light-high-contrast", dark: "github-dark-high-contrast" },
    components: {
      pre: (p) => <pre {...p} tabIndex={0} className={`${p.className ?? ""} kf-snippet overflow-x-auto py-4 font-mono text-[13px] leading-6 outline-none focus-visible:ring-3 focus-visible:ring-ring/50`} />,
    },
  })

export default async function Page(props: PageProps<"/ui/[slug]">) {
  const c = uiComponent((await props.params).slug)
  if (!c) notFound()
  const index = UI_ORDER.indexOf(c)
  const previous = UI_ORDER[index - 1]
  const next = UI_ORDER[index + 1]
  // The component's own file, exactly as the CLI installs it (synced from registry/ into the site).
  const source = await fs.readFile(path.join(process.cwd(), "components/keyframery", `${c.slug}.tsx`), "utf8").catch(() => null)

  return (
    <DocsPage toc={c.wide ? undefined : TOC} full={c.wide}>
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link href="/ui" className="hover:text-foreground">
          Components
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page" className="text-foreground">
          {c.name}
        </span>
      </nav>
      <header className="mt-3 grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="flex items-center gap-3">
            <DocsTitle className="text-[32px] leading-[1.15] tracking-[-0.025em]">{c.name}</DocsTitle>
            <Tag status={c.status} />
          </div>
          <div className="flex items-center gap-1.5">
            {[
              { item: previous, label: "Previous", Icon: ArrowLeft },
              { item: next, label: "Next", Icon: ArrowRight },
            ].map(({ item, label, Icon }) =>
              item ? (
                <Link
                  key={label}
                  href={`/ui/${item.slug}`}
                  aria-label={`${label}: ${item.name}`}
                  className="grid size-8 place-items-center rounded-md border bg-fd-secondary text-fd-secondary-foreground outline-none hover:bg-fd-accent focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <Icon aria-hidden="true" className="size-3.5" />
                </Link>
              ) : null,
            )}
          </div>
        </div>
        <DocsDescription className="mb-0 max-w-[68ch] text-[17px] leading-relaxed text-pretty">{c.summary}</DocsDescription>
      </header>

      <section id="preview" aria-label="Preview" className="mt-8 scroll-mt-24">
        <PreviewTabs preview={<Demo slug={c.slug} size="large" />} code={<CodeBlock code={c.usage}>{await code(c.usage)}</CodeBlock>} />
      </section>

          <section aria-labelledby="installation" className="mt-14">
            <h2 id="installation" className="scroll-mt-24 text-xl font-semibold tracking-[-0.01em]">
              Installation
            </h2>
            <div className="mt-4">
              <InstallTabs
                slug={c.slug}
                packages={c.packages}
                source={
                  source ? (
                    <CodeBlock code={source} tall>
                      {await code(source)}
                    </CodeBlock>
                  ) : null
                }
              />
            </div>
          </section>

          <section aria-labelledby="props" className="mt-12">
            <h2 id="props" className="scroll-mt-24 text-xl font-semibold tracking-[-0.01em]">
              Props
            </h2>
            {/* Focusable, so keyboard users can scroll it sideways on a phone. */}
            <div tabIndex={0} role="region" aria-labelledby="props" className="mt-4 overflow-x-auto rounded-xl border outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 font-medium">Prop</th>
                    <th scope="col" className="px-4 py-2.5 font-medium">Type</th>
                    <th scope="col" className="px-4 py-2.5 font-medium">Default</th>
                    <th scope="col" className="px-4 py-2.5 font-medium">What it does</th>
                  </tr>
                </thead>
                <tbody>
                  {c.props.map((p) => (
                    <tr key={p.name} className="border-t align-top">
                      <td className="px-4 py-3 font-mono text-[13px] whitespace-nowrap">{p.name}</td>
                      <td className="px-4 py-3 font-mono text-[13px] text-muted-foreground">{p.type}</td>
                      <td className="px-4 py-3 font-mono text-[13px] whitespace-nowrap text-muted-foreground">{p.fallback ?? "—"}</td>
                      <td className="px-4 py-3 text-pretty">{p.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="accessibility" className="mt-12">
            <h2 id="accessibility" className="scroll-mt-24 text-xl font-semibold tracking-[-0.01em]">
              Accessibility and motion
            </h2>
            <ul className="mt-4 grid max-w-[68ch] list-disc gap-2 pl-5 text-pretty">
              {c.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </section>
    </DocsPage>
  )
}
