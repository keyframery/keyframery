import { Tabs, TabsList, TabsPanel, TabsPanels, TabsTab } from "@/components/ui/tabs"

export default function Usage() {
  return (
    <Tabs defaultValue="account">
      <TabsList aria-label="Settings">
        <TabsTab value="account">Account</TabsTab>
        <TabsTab value="password">Password</TabsTab>
      </TabsList>
      <TabsPanels>
        <TabsPanel value="account">Account settings</TabsPanel>
        <TabsPanel value="password">Password settings</TabsPanel>
      </TabsPanels>
    </Tabs>
  )
}
