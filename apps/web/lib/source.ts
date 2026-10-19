import { llms, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { renderDocMarkdown } from './doc-markdown';
import { docsContentRoute, docsImageRoute, docsRoute } from './shared';
import { defineDocs } from 'fumadocs-mdx/macro';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';

/** A docs page's own questions: shown at the end of the page, in its FAQ structured data, in search and in llms.txt. */
export const faqSchema = z.array(z.object({ q: z.string(), a: z.string() }));

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema.extend({
      /** The search-result title (the layout adds " | Keyframery"); the sidebar keeps `title`. */
      seoTitle: z.string().optional(),
      /** The page's H1, when the sidebar's short `title` would be too vague on its own. */
      heading: z.string().optional(),
      faq: faqSchema.optional(),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

export const docsLlms = llms(source, {
  renderPage: async (page) => renderDocMarkdown({
    title: page.data.heading ?? page.data.title,
    url: page.url,
    description: page.data.description,
    body: await page.data.getText('processed'),
    faq: page.data.faq,
  }),
});
