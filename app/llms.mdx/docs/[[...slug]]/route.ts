import { notFound } from "next/navigation"

import { getPageMarkdownUrl, url } from "@site/lib/shared"
import { docsLlms, source } from "@site/lib/source"

export const revalidate = false

export async function GET(_req: Request, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params
  const page = source.getPage(slug?.slice(0, -1))
  if (!page) notFound()
  // The HTML page is the one to index; this copy points search engines at it.
  return new Response(await docsLlms.page(page), {
    headers: { "Content-Type": "text/markdown; charset=utf-8", Link: `<${url(page.url)}>; rel="canonical"`, "X-Robots-Tag": "noindex" },
  })
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({ slug: getPageMarkdownUrl(page).segments }))
}
