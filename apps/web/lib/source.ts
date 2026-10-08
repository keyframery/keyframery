import { llms, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { cleanDocMarkdown } from './doc-markdown';
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

/** The FAQ as Markdown, appended to a page's Markdown for AI tools. */
export function faqMarkdown(faq: z.infer<typeof faqSchema> | undefined) {
  if (!faq?.length) return '';
  return `\n\n## Questions\n\n${faq.map(({ q, a }) => `### ${q}\n\n${a}`).join('\n\n')}\n`;
}

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.heading ?? page.data.title} (${page.url})

${cleanDocMarkdown(await page.data.getText('processed'))}${faqMarkdown(page.data.faq)}`,
});
