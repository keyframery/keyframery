// Open on hover
// `openOnHover` opens it while the pointer rests on the trigger, after `delay`. A click still opens it too.
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function PopoverHover() {
  return (
    <Popover openOnHover delay={200}>
      <PopoverTrigger>Hover me</PopoverTrigger>
      <PopoverContent className="w-60 text-[13px]">Stays open while the pointer is over it, so you can click inside.</PopoverContent>
    </Popover>
  )
}
