import { llms, loader } from "fumadocs-core/source"
import { metaSchema, pageSchema } from "fumadocs-core/source/schema"
import { defineDocs } from "fumadocs-mdx/macro"
import { z } from "zod"

import { renderDocMarkdown } from "./doc-markdown"
import { docsRoute } from "./shared"

/** A docs page's own questions: shown at the end of the page, in its FAQ structured data, in search and in llms.txt. */
export const faqSchema = z.array(z.object({ q: z.string(), a: z.string() }))

const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema.extend({
      /** The page's H1, when the sidebar's short `title` would be too vague on its own. */
      heading: z.string().optional(),
      /** A component page: its slug, so the page can show the component's facts under the title. */
      component: z.string().optional(),
      faq: faqSchema.optional(),
    }),
    postprocess: { includeProcessedMarkdown: true },
  },
  meta: { schema: metaSchema },
})

export const source = loader({ baseUrl: docsRoute, source: docs.toFumadocsSource() })

export const docsLlms = llms(source, {
  renderPage: async (page) =>
    renderDocMarkdown({
      title: page.data.heading ?? page.data.title,
      url: page.url,
      description: page.data.description,
      body: await page.data.getText("processed"),
      faq: page.data.faq,
    }),
})
