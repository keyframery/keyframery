// Horizontal and vertical
// Between sections or between items in a row. `decorative` hides it from screen readers when it only adds space.
import { Separator } from "@/components/ui/separator"

export default function SeparatorBasic() {
  return (
    <div className="w-full max-w-[300px] text-[13px]">
      <div className="font-medium">Keyframery</div>
      <div className="text-muted-foreground">Animated components for UI SDK</div>
      <Separator className="my-3" />
      <div className="flex h-4 items-center gap-3 text-muted-foreground">
        <span>Docs</span>
        <Separator orientation="vertical" />
        <span>Components</span>
        <Separator orientation="vertical" />
        <span>Changelog</span>
      </div>
    </div>
  )
}
