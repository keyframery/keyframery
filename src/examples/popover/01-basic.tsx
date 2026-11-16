// With a title and a form
// A popover holds interactive content. Focus moves into it, and Escape or a click outside closes it.
import { Input } from "@/components/ui/input"
import { Popover, PopoverArrow, PopoverClose, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"

export default function PopoverBasic() {
  return (
    <Popover>
      <PopoverTrigger>Set a reminder</PopoverTrigger>
      <PopoverContent className="w-72">
        <PopoverArrow />
        <PopoverTitle>Reminder</PopoverTitle>
        <PopoverDescription>We'll nudge you about this task.</PopoverDescription>
        <div className="mt-3 flex gap-2">
          <Input aria-label="Remind me in" defaultValue="2 hours" />
          <PopoverClose variant="primary">Save</PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  )
}
