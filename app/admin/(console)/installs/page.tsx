import { InstallsView } from "@site/components/admin/views"
import { installs, periodOf } from "@site/lib/admin/data"
import { requireAdmin } from "@site/lib/admin/session"

export const metadata = { title: "Installs" }

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin()
  return <InstallsView data={await installs(periodOf((await searchParams).days))} />
}
