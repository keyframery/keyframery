// With a shortcut
// `shortcut` on the tooltip shows the keys with `TooltipShortcut` and presses the trigger when they're pressed.
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipArrow, TooltipContent, TooltipShortcut, TooltipTrigger } from "@/components/ui/tooltip"

export default function TooltipShortcutExample() {
  return (
    <Tooltip shortcut="mod+s">
      <TooltipTrigger render={<Button />}>Save</TooltipTrigger>
      <TooltipContent>
        <TooltipArrow />
        Save the draft
        <TooltipShortcut />
      </TooltipContent>
    </Tooltip>
  )
}
