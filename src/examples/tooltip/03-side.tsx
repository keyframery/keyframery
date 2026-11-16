// Placement
// `side` picks where it appears. It flips when there isn't room.
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export default function TooltipSide() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Tooltip key={side} delay={200}>
          <TooltipTrigger render={<Button size="sm" />}>{side}</TooltipTrigger>
          <TooltipContent side={side}>On the {side}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
