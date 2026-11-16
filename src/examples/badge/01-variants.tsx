// Variants
import { Badge } from "@/components/ui/badge"

export default function BadgeVariants() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">Paid</Badge>
      <Badge variant="destructive">Overdue</Badge>
    </div>
  )
}
