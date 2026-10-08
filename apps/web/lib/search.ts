import { createFromSource } from 'fumadocs-core/search/server';

import { source } from './source';

/**
 * One index for the ⌘K search route and the MCP search_docs tool. Each page's FAQ (frontmatter, rendered under
 * "Questions") is indexed too, so a search for a question finds the page that answers it.
 */
export const docsSearch = createFromSource(source, {
  buildIndex(page) {
    const base = page.data.structuredData;
    const faq = page.data.faq ?? [];
    return {
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      id: page.url,
      structuredData: faq.length
        ? {
            headings: [...base.headings, { id: 'questions', content: 'Questions' }],
            contents: [...base.contents, ...faq.flatMap(({ q, a }) => [{ heading: 'questions', content: `${q} ${a}` }])],
          }
        : base,
    };
  },
});
