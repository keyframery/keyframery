import { DocsPage } from "fumadocs-ui/layouts/docs/page"
import type { Metadata } from "next"
import Link from "next/link"

import { CardPreview } from "@/components/ui-library/cards"
import { Tag } from "@/components/ui-library/tag"
import { pageMetadata } from "@/lib/seo"
import { UI_ORDER, UI_SOON } from "@/lib/ui-library"

export const metadata: Metadata = pageMetadata({
  title: "Animated components for shadcn/ui",
  description: "An OTP field that works like a combination lock, pagination that shows a page before you click it. Everyday shadcn/ui components that are fun to use.",
  path: "/ui",
})

export default function Page() {
  return (
    <DocsPage full>
      <header className="grid gap-x-12 gap-y-4 pt-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
        <h1 className="text-[34px] leading-[1.06] font-semibold tracking-[-0.03em] text-balance md:text-[42px]">Animated components for shadcn/ui</h1>
        <p className="max-w-[52ch] text-[17px] leading-relaxed text-pretty text-muted-foreground">
          A code field. A row of page numbers. The parts of an app nobody looks at twice, made into something people enjoy using. Add one with the shadcn CLI and it picks up your theme.
        </p>
      </header>
      <section aria-label="Components" className="mt-12 grid gap-6 md:grid-cols-2">
        {UI_ORDER.map((c) => (
          <article key={c.slug} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card transition-[border-color,box-shadow] duration-200 hover:border-foreground/20 hover:shadow-[0_12px_32px_-16px_rgb(0_0_0/0.22)]">
            <CardPreview component={c} />
            <div className="border-t px-5 py-4">
              <h2 className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.01em]">
                <Link href={`/ui/${c.slug}`} className="outline-none hover:underline hover:underline-offset-4 focus-visible:underline">
                  {c.name}
                </Link>
                <Tag status={c.status} />
              </h2>
              <p className="mt-1 max-w-[52ch] text-sm text-pretty text-muted-foreground">{c.tagline}</p>
            </div>
          </article>
        ))}
      </section>
      {UI_SOON.length > 0 && (
        <section aria-labelledby="next-up" className="mt-14">
          <h2 id="next-up" className="text-sm font-medium text-muted-foreground">
            Coming next
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {UI_SOON.map((c) => (
              <li key={c.slug} className="rounded-xl border border-dashed p-4">
                <p className="flex items-center gap-2 font-medium">
                  {c.name}
                  <Tag status="soon" />
                </p>
                <p className="mt-2 text-sm text-pretty text-muted-foreground">{c.tagline}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </DocsPage>
  )
}
