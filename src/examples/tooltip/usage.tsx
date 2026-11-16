import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export default function Usage() {
  return (
    <Tooltip>
      <TooltipTrigger>Hover</TooltipTrigger>
      <TooltipContent>Add to library</TooltipContent>
    </Tooltip>
  )
}
