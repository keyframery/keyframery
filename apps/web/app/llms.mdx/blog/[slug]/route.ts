import { notFound } from "next/navigation"

import { blog, postMarkdown } from "@/lib/blog"

export const revalidate = false

export async function GET(_req: Request, { params }: RouteContext<"/llms.mdx/blog/[slug]">) {
  const { slug } = await params
  const post = blog.getPage([slug])
  if (!post) notFound()
  // The HTML page is the one to index; this copy points search engines at it.
  return new Response(await postMarkdown(post), {
    headers: { "Content-Type": "text/markdown; charset=utf-8", Link: `<https://keyframery.com${post.url}>; rel="canonical"` },
  })
}

export function generateStaticParams() {
  return blog.getPages().map((post) => ({ slug: post.slugs[0] }))
}
