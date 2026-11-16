// Status dot
// `dot` adds a coloured dot before the label, for a status.
import { Badge } from "@/components/ui/badge"

export default function BadgeDot() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Badge dot variant="success">
        Online
      </Badge>
      <Badge dot variant="destructive">
        Delayed
      </Badge>
      <Badge dot variant="outline">
        Draft
      </Badge>
    </div>
  )
}
