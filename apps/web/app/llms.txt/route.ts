import { allPosts } from '@/lib/blog';
import { docsLlms } from '@/lib/source';
import { UI_ORDER } from '@/lib/ui-library';

export const revalidate = false;

const SITE = 'https://keyframery.com';

const HEADER = `# Keyframery

> Keyframery is an open-source (MIT) motion layer for shadcn/ui. One <Cuts /> line in the root layout animates the dialogs, sheets, drawers, tabs, toasts and menus an app already has, with no edits to components/ui. MatchCut, ListCut, ValueCut, LoadCut and StateCut cover cards, lists, numbers, loading and state changes. It installs with the shadcn CLI (npx shadcn add @keyframery/cuts), adds no npm dependencies, and works on Base UI and Radix.

- Full docs in one file: ${SITE}/llms-full.txt
- Every docs page is also Markdown: add .mdx to its URL
- Skill for coding agents: ${SITE}/.well-known/agent-skills/keyframery/SKILL.md (in Claude Code: /plugin marketplace add keyframery/keyframery)
- Motion themes (Quiet, Crisp, Expressive or your own): ${SITE}/theme
- Source: https://github.com/keyframery/keyframery`;

/**
 * Fumadocs' index lists sections as bold bullets with site-relative links to the HTML pages. The llms.txt format
 * expects "##" sections, and agents do best with absolute links to the Markdown versions.
 */
function normalize(index: string) {
  return index
    .replace(/^# .*\n/, '')
    .replace(/^- \*\*(.+?)\*\*$/gm, '## $1\n')
    .replace(/\]\((\/docs[^)]*)\)/g, (_, path: string) => `](${SITE}${path}.mdx)`)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function GET() {
  const ui = UI_ORDER.map((c) => `- [${c.name}](${SITE}/ui/${c.slug}): ${c.description}`);
  const posts = allPosts().map((p) => `- [${p.data.title}](${SITE}${p.url}.md): ${p.data.description}`);
  const body = [
    HEADER,
    normalize(await docsLlms.index()),
    `## Keyframery UI\n\nNew animated components for shadcn/ui, installed one by one with the shadcn CLI. Overview: ${SITE}/ui\n\n${ui.join('\n')}`,
    ...(posts.length ? [`## Blog\n\n${posts.join('\n')}`] : []),
  ];
  return new Response(`${body.join('\n\n')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
