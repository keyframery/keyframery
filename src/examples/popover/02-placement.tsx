// Placement
// `side` and `align` choose where it opens. It flips by itself when there isn't room.
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function PopoverPlacement() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Popover key={side}>
          <PopoverTrigger>{side}</PopoverTrigger>
          <PopoverContent side={side} className="text-[13px]">
            Opened on the {side}.
          </PopoverContent>
        </Popover>
      ))}
    </div>
  )
}
