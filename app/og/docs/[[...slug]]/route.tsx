import { notFound } from "next/navigation"

import { ogImage } from "@site/lib/og"
import { source } from "@site/lib/source"

export const revalidate = false

/* A social card per docs page: /og/docs/<path>/image.png */
export async function GET(_req: Request, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params
  const page = source.getPage(slug.slice(0, -1))
  if (!page) notFound()
  const component = page.data.component
  return ogImage({
    eyebrow: component ? "Component" : "Docs",
    title: component ? `${page.data.title} for UI SDK, animated` : (page.data.heading ?? page.data.title),
    footer: (page.data.description ?? "").slice(0, 110) + ((page.data.description ?? "").length > 110 ? "…" : ""),
  })
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({ slug: [...page.slugs, "image.png"] }))
}
