import { AdminShell } from "@site/components/admin/shell"
import { requireAdmin } from "@site/lib/admin/session"

import { signOut } from "../actions"

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  return <AdminShell signOut={signOut}>{children}</AdminShell>
}
