import { docsLlms } from '@/lib/source';

export const revalidate = false;

const HEADER = `# Keyframery

> Animations for shadcn/ui. One <Cuts /> line gives dialogs, sheets, tabs and toasts real cuts; MatchCut, ListCut, ValueCut, LoadCut and StateCut cover the rest. Motion themes (Quiet, Crisp, Expressive or your own): https://keyframery.com/theme. Full docs in one file: https://keyframery.com/llms-full.txt. MCP server: https://keyframery.com/mcp`;

export async function GET() {
  // Fumadocs titles the index after the docs root ("# Docs"); name the product instead.
  const index = await docsLlms.index();
  return new Response(index.replace(/^# .*\n/, `${HEADER}\n`), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
