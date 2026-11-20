import type { Metadata } from "next"

/* Keyframery's own admin: analytics for keyframery.com, behind one password (site/lib/admin/session.ts).
   Never indexed, never counted as a page view. */
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Keyframery admin" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
