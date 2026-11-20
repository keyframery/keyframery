import { AgentsView } from "@site/components/admin/views"
import { agents, periodOf } from "@site/lib/admin/data"
import { requireAdmin } from "@site/lib/admin/session"

export const metadata = { title: "AI agents" }

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin()
  return <AgentsView data={await agents(periodOf((await searchParams).days))} />
}
