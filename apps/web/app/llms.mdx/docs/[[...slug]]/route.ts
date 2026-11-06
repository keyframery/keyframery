import { docsLlms, source } from '@/lib/source';
import { getPageMarkdownUrl } from '@/lib/shared';
import { notFound } from 'next/navigation';
import { markdownCopyHeaders } from '@/lib/page-markdown';

export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<'/llms.mdx/docs/[[...slug]]'>) {
  const { slug } = await params;
  const page = source.getPage(slug?.slice(0, -1));
  if (!page) notFound();

  // The HTML page is the one to index; this copy points search engines at it.
  return new Response(await docsLlms.page(page), { headers: markdownCopyHeaders(page.url) });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageMarkdownUrl(page).segments,
  }));
}
