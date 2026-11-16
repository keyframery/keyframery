// Controlled
// Pass `collapsed` and `onCollapsedChange` to drive it from your own state, like a saved setting.
import { Home, Inbox } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInset,
  SidebarLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function SidebarControlled() {
  const [collapsed, setCollapsed] = React.useState(false)
  return (
    <SidebarProvider
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
      mobileBreakpoint={420}
      className="h-[220px] w-full max-w-[520px] overflow-hidden rounded-[14px] border bg-background"
    >
      <Sidebar>
        <SidebarContent className="pt-2">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive tooltip="Home">
                    <Home />
                    <SidebarLabel>Home</SidebarLabel>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Inbox">
                    <Inbox />
                    <SidebarLabel>Inbox</SidebarLabel>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col items-start gap-3 p-5">
        <span className="text-[13px] text-muted-foreground">collapsed: {String(collapsed)}</span>
        <Button size="sm" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? "Expand" : "Collapse"}
        </Button>
      </SidebarInset>
    </SidebarProvider>
  )
}
