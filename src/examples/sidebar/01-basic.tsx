// Basic
// Mark the current page with `isActive`. The highlight glides to it.
import { Calendar, Home, Inbox, Search } from "lucide-react"
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
} from "@/components/ui/sidebar"

const pages = [
  { title: "Home", icon: Home },
  { title: "Inbox", icon: Inbox },
  { title: "Calendar", icon: Calendar },
  { title: "Search", icon: Search },
]

export default function SidebarBasic() {
  const [active, setActive] = React.useState("Home")
  return (
    <SidebarProvider mobileBreakpoint={420} className="h-[280px] w-full max-w-[520px] overflow-hidden rounded-[14px] border bg-background">
      <Sidebar>
        <SidebarContent className="pt-2">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {pages.map((page) => (
                  <SidebarMenuItem key={page.title}>
                    <SidebarMenuButton isActive={active === page.title} onClick={() => setActive(page.title)}>
                      <page.icon />
                      <SidebarLabel>{page.title}</SidebarLabel>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="p-5 text-[15px] font-semibold">{active}</SidebarInset>
    </SidebarProvider>
  )
}
