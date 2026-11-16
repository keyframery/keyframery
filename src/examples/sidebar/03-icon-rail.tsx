// Icon rail
// `SidebarTrigger` narrows the sidebar to its icons and back. On the rail, `tooltip` names each item.
import { Home, Inbox, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const items = [
  { title: "Home", icon: Home },
  { title: "Inbox", icon: Inbox },
  { title: "Settings", icon: Settings },
]

export default function SidebarIconRail() {
  return (
    <SidebarProvider defaultCollapsed mobileBreakpoint={420} className="h-[260px] w-full max-w-[520px] overflow-hidden rounded-[14px] border bg-background">
      <Sidebar>
        <SidebarHeader>
          <SidebarTrigger />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item, i) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton isActive={i === 0} tooltip={item.title}>
                      <item.icon />
                      <SidebarLabel>{item.title}</SidebarLabel>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="p-5 text-[13px] text-muted-foreground">Press the button at the top to widen it.</SidebarInset>
    </SidebarProvider>
  )
}
