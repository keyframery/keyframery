// Basic
// The key glides to the chosen tab, and the panels slide in from the side you moved towards.
import { Tabs, TabsList, TabsPanel, TabsPanels, TabsTab } from "@/components/ui/tabs"

export default function TabsBasic() {
  return (
    <Tabs defaultValue="overview" className="w-full max-w-[380px]">
      <TabsList aria-label="Project">
        <TabsTab value="overview">Overview</TabsTab>
        <TabsTab value="activity">Activity</TabsTab>
        <TabsTab value="settings">Settings</TabsTab>
      </TabsList>
      <TabsPanels className="h-[90px] text-[13px] text-muted-foreground">
        <TabsPanel value="overview">12 open tasks, 3 due this week.</TabsPanel>
        <TabsPanel value="activity">Maya closed “Fix the login page” 2 hours ago.</TabsPanel>
        <TabsPanel value="settings">Rename the project or archive it.</TabsPanel>
      </TabsPanels>
    </Tabs>
  )
}
