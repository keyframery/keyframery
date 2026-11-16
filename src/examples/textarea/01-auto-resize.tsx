// Grows as you type
// `autoResize` makes it as tall as its text. Cap it with a `max-h` class.
import { Textarea } from "@/components/ui/textarea"

export default function TextareaAutoResize() {
  return <Textarea autoResize aria-label="Note" placeholder="Type a few lines…" className="w-full max-w-[320px] max-h-[200px]" />
}
