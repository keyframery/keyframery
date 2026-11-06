import { flattenTree } from 'fumadocs-core/page-tree';

import { allPosts, postMarkdown } from '@/lib/blog';
import { docsLlms, source } from '@/lib/source';

export const revalidate = false;

/** Every docs page in sidebar order (Introduction and Quick start first), then the blog posts. */
export async function GET() {
  const urls = flattenTree(source.getPageTree().children).map((item) => item.url);
  const ordered = urls.map((u) => source.getPages().find((p) => p.url === u)).filter((p) => p !== undefined);
  // Pages the sidebar doesn't list still belong in the full file, after the rest.
  const rest = source.getPages().filter((p) => !urls.includes(p.url));
  const docs = await Promise.all([...ordered, ...rest].map((page) => docsLlms.page(page)));
  const posts = await Promise.all(allPosts().map(postMarkdown));
  return new Response([...docs, ...posts].join('\n\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
