// Controlled
// Pass `value` and `onValueChange`, for example to keep the tab in the URL.
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsPanel, TabsPanels, TabsTab } from "@/components/ui/tabs"

export default function TabsControlled() {
  const [tab, setTab] = React.useState("details")
  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v ?? "details")} className="w-full max-w-[380px]">
      <TabsList aria-label="Checkout">
        <TabsTab value="details">Details</TabsTab>
        <TabsTab value="payment">Payment</TabsTab>
      </TabsList>
      <TabsPanels className="h-[90px] pt-1">
        <TabsPanel value="details">
          <Button size="sm" variant="primary" onClick={() => setTab("payment")}>
            Continue to payment
          </Button>
        </TabsPanel>
        <TabsPanel value="payment" className="text-[13px] text-muted-foreground">
          Card details go here.
        </TabsPanel>
      </TabsPanels>
    </Tabs>
  )
}
