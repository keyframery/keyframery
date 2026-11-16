// Basic
// The panel opens to its real height. The trigger's text can follow the state.
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function CollapsibleBasic() {
  return (
    <Collapsible className="w-full max-w-[360px]">
      <CollapsibleTrigger>{(state) => (state.open ? "Hide order details" : "Show order details")}</CollapsibleTrigger>
      <CollapsiblePanel>
        <dl className="grid grid-cols-2 gap-y-1.5 pt-2 text-[13px]">
          <dt className="text-muted-foreground">Order</dt>
          <dd>#40213</dd>
          <dt className="text-muted-foreground">Placed</dt>
          <dd>3 June</dd>
          <dt className="text-muted-foreground">Total</dt>
          <dd>£86.40</dd>
        </dl>
      </CollapsiblePanel>
    </Collapsible>
  )
}
