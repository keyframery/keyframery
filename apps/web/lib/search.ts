import { createFromSource } from 'fumadocs-core/search/server';

import { source } from './source';

/** One index for the ⌘K search route and the MCP search_docs tool. */
export const docsSearch = createFromSource(source);
