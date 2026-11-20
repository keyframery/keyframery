import { OverviewView } from "@site/components/admin/overview"
import { overview, periodOf } from "@site/lib/admin/data"
import { requireAdmin } from "@site/lib/admin/session"

export const metadata = { title: "Overview" }

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  // The layout checks too; each page checks again, because a page can render without its layout re-running.
  await requireAdmin()
  return <OverviewView data={await overview(periodOf((await searchParams).days))} />
}
