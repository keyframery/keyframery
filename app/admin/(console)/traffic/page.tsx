import { TrafficView } from "@site/components/admin/views"
import { traffic, periodOf } from "@site/lib/admin/data"
import { requireAdmin } from "@site/lib/admin/session"

export const metadata = { title: "Traffic" }

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin()
  return <TrafficView data={await traffic(periodOf((await searchParams).days))} />
}
