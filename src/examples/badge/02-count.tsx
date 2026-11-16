// Count
// Pass `count` and the digits roll to each new number. Past `max` it shows 99+.
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function BadgeCount() {
  const [count, setCount] = React.useState(3)
  return (
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-2 text-[14px] font-medium">
        Inbox
        <Badge count={count} max={99} />
      </span>
      <Button size="sm" onClick={() => setCount((n) => n + 7)}>
        Get mail
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setCount(0)}>
        Clear
      </Button>
    </div>
  )
}
