// On a phone
// Below `mobileBreakpoint` (640px by default) the sidebar becomes a sheet. Put a `SidebarTrigger` in the page to open it; choosing an item closes it.
import { Home, Inbox, Menu, Settings } from "lucide-react"
import * as React from "react"

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
  SidebarTrigger,
} from "@/components/ui/sidebar"

const items = [
  { title: "Home", icon: Home },
  { title: "Inbox", icon: Inbox },
  { title: "Settings", icon: Settings },
]

export default function SidebarMobile() {
  const [active, setActive] = React.useState("Home")
  return (
    <SidebarProvider className="h-[360px] w-full max-w-[340px] overflow-hidden rounded-[22px] border bg-background">
      <Sidebar>
        <SidebarContent className="pt-3">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton isActive={active === item.title} onClick={() => setActive(item.title)}>
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
      <SidebarInset className="p-3">
        <div className="flex items-center gap-2">
          <SidebarTrigger aria-label="Open menu">
            <Menu />
          </SidebarTrigger>
          <span className="text-[15px] font-semibold">{active}</span>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
