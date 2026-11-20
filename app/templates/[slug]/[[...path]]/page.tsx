import { Inter } from "next/font/google"
import { notFound } from "next/navigation"

import { TemplateView } from "@site/components/templates/template-view"
import { pageMetadata } from "@site/lib/seo"
import { template, templates } from "@site/lib/templates"

/* `path` is the address inside a template that has pages of its own (an admin: /templates/backroom/orders/1042).
   A one-page template (a landing page) has nothing under it. */
type Props = { params: Promise<{ slug: string; path?: string[] }> }

// Inter with optical sizing: the Display cut at headline sizes, as on the site's own landing page.
const display = Inter({ subsets: ["latin"], axes: ["opsz"], variable: "--font-template", display: "swap" })

/** A template, full screen, with nothing of the site around it. The docs page embeds this route. */
export default async function Page({ params }: Props) {
  const { slug, path } = await params
  const item = template(slug)
  if (!item || (path?.length && !item.pages)) notFound()
  return (
    <div className={`${display.variable} flex flex-1 flex-col`} style={{ "--rnd-font": "var(--font-template)" } as React.CSSProperties}>
      <TemplateView slug={item.slug} name={item.name} path={path?.length ? `/${path.map(encodeURIComponent).join("/")}` : "/"} />
    </div>
  )
}

export function generateStaticParams() {
  return templates.map(({ slug }) => ({ slug, path: [] }))
}

export async function generateMetadata({ params }: Props) {
  const { slug, path } = await params
  const item = template(slug)
  if (!item || (path?.length && !item.pages)) notFound()
  // The template's own docs page is the one to index; this is the page it shows.
  return { ...pageMetadata({ title: `${item.name}: live preview`, description: item.description, path: `/templates/${item.slug}` }), robots: { index: false, follow: true } }
}
