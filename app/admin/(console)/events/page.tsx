import { EventsView } from "@site/components/admin/views"
import { recentEvents } from "@site/lib/admin/data"
import { requireAdmin } from "@site/lib/admin/session"

export const metadata = { title: "Event log" }

export default async function Page() {
  await requireAdmin()
  return <EventsView data={await recentEvents()} />
}
