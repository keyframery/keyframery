import { Plus } from "lucide-react"
import Link from "next/link"

/* The header's way into /create: a small key beside the GitHub and theme controls. Its look (a faint
   top-to-bottom gradient, a hairline of light on the top edge, a soft drop) is .kf-create-key in
   app/globals.css. On a phone it is the plus alone. */
export function CreateNavButton({ className }: { className?: string }) {
  return (
    <Link href="/create" className={className ? `kf-create-key ${className}` : "kf-create-key"} aria-label="Create a preset">
      <Plus aria-hidden className="size-3.5" strokeWidth={2.25} />
      <span className="max-md:hidden">Create</span>
    </Link>
  )
}
