// Icons
// `TabsTabIcon` holds an icon inside a tab. Screen readers skip it, so a tab with only an icon needs an `aria-label`.
import { CalendarDays, List, MapPin } from "lucide-react"

import { Tabs, TabsList, TabsPanel, TabsPanels, TabsTab, TabsTabIcon } from "@/components/ui/tabs"

export default function TabsIcons() {
  return (
    <Tabs defaultValue="list" className="w-full max-w-[340px]">
      <TabsList aria-label="View">
        <TabsTab value="list">
          <TabsTabIcon>
            <List />
          </TabsTabIcon>
          List
        </TabsTab>
        <TabsTab value="map">
          <TabsTabIcon>
            <MapPin />
          </TabsTabIcon>
          Map
        </TabsTab>
        <TabsTab value="dates">
          <TabsTabIcon>
            <CalendarDays />
          </TabsTabIcon>
          Dates
        </TabsTab>
      </TabsList>
      <TabsPanels>
        <TabsPanel value="list" className="text-[13.5px] text-muted-foreground">Every walk, nearest first.</TabsPanel>
        <TabsPanel value="map" className="text-[13.5px] text-muted-foreground">The same walks on a map.</TabsPanel>
        <TabsPanel value="dates" className="text-[13.5px] text-muted-foreground">Walks by the day you planned them.</TabsPanel>
      </TabsPanels>
    </Tabs>
  )
}
