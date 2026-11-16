// With a label
// Put a `SeparatorLabel` between two separators for an “or” line.
import { Button } from "@/components/ui/button"
import { Separator, SeparatorLabel } from "@/components/ui/separator"

export default function SeparatorWithLabel() {
  return (
    <div className="flex w-full max-w-[280px] flex-col gap-3">
      <Button variant="primary">Continue with Google</Button>
      <div className="flex items-center">
        <Separator decorative />
        <SeparatorLabel>or</SeparatorLabel>
        <Separator decorative />
      </div>
      <Button>Continue with email</Button>
    </div>
  )
}
