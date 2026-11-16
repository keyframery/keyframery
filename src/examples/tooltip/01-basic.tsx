// Icon buttons
// A tooltip names a button that only shows an icon. Once one is open, the next opens at once as you move along.
import { Bell, Search, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const items = [
  { label: "Search", icon: Search },
  { label: "Notifications", icon: Bell },
  { label: "Settings", icon: Settings },
]

export default function TooltipBasic() {
  return (
    <div className="flex gap-1">
      {items.map((item) => (
        <Tooltip key={item.label}>
          <TooltipTrigger render={<Button size="icon" variant="ghost" aria-label={item.label} />}>
            <item.icon />
          </TooltipTrigger>
          <TooltipContent>{item.label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
