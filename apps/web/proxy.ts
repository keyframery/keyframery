import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';
import { docsContentRoute, docsRoute } from '@/lib/shared';
import { classifyClient, classifyRequest, recordUsage } from '@/lib/usage';

const { rewrite: rewriteDocs } = rewritePath(
  `${docsRoute}{/*path}`,
  `${docsContentRoute}{/*path}/content.md`,
);
const { rewrite: rewriteSuffix } = rewritePath(
  `${docsRoute}{/*path}.md`,
  `${docsContentRoute}{/*path}/content.md`,
);
// the docs advertise .mdx (e.g. /docs/helpers/list-cut.mdx); .md keeps working too
const { rewrite: rewriteMdx } = rewritePath(
  `${docsRoute}{/*path}.mdx`,
  `${docsContentRoute}{/*path}/content.md`,
);

/** Pages outside the docs that also have a Markdown version (app/<name>.md/route.ts). */
const PAGE_MARKDOWN: Record<string, string> = { '/': '/index.md', '/cuts': '/cuts.md', '/theme': '/theme.md' };

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  // Installs and agent reads load no analytics script, so they're counted here (lib/usage.ts), after the response.
  const hit = classifyRequest(request.method, request.nextUrl.pathname, isMarkdownPreferred(request));
  if (hit) event.waitUntil(recordUsage({ ...hit, client: classifyClient(request.headers.get('user-agent')) }));

  const result = rewriteMdx(request.nextUrl.pathname) || rewriteSuffix(request.nextUrl.pathname);
  if (result) {
    return NextResponse.rewrite(new URL(result, request.nextUrl));
  }

  if (isMarkdownPreferred(request)) {
    const result = PAGE_MARKDOWN[request.nextUrl.pathname] ?? rewriteDocs(request.nextUrl.pathname);

    if (result) {
      return NextResponse.rewrite(new URL(result, request.nextUrl), {
        // this URL has two representations, selected by `Accept`
        headers: { Vary: 'Accept' },
      });
    }
  }

  return NextResponse.next();
}
