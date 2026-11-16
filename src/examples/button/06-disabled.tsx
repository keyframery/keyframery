// Disabled
// Pass `focusableWhenDisabled` to keep it in the tab order, so a tooltip can say why.
import { Button } from "@/components/ui/button"

export default function ButtonDisabled() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button disabled>Sold out</Button>
      <Button variant="primary" disabled focusableWhenDisabled>
        Pay now
      </Button>
    </div>
  )
}
