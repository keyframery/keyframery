import { flattenTree } from "fumadocs-core/page-tree"

import { docsLlms, source } from "@site/lib/source"

export const revalidate = false

/** Every docs page in sidebar order, in one plain-text file. */
export async function GET() {
  const urls = flattenTree(source.getPageTree().children).map((item) => item.url)
  const ordered = urls.map((u) => source.getPages().find((p) => p.url === u)).filter((p) => p !== undefined)
  const rest = source.getPages().filter((p) => !urls.includes(p.url))
  const docs = await Promise.all([...ordered, ...rest].map((page) => docsLlms.page(page)))
  return new Response(docs.join("\n\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } })
}
