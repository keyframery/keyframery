// Collapsible group
// Pass `collapsible` to a group and its label folds it away. `SidebarMenuBadge` shows a count.
import { FolderClosed, Inbox, Star } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function SidebarCollapsibleGroup() {
  return (
    <SidebarProvider mobileBreakpoint={420} className="h-[300px] w-full max-w-[520px] overflow-hidden rounded-[14px] border bg-background">
      <Sidebar>
        <SidebarContent className="pt-2">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>
                    <Inbox />
                    <SidebarLabel>Inbox</SidebarLabel>
                    <SidebarMenuBadge>12</SidebarMenuBadge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Star />
                    <SidebarLabel>Starred</SidebarLabel>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup collapsible defaultOpen>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {["Website", "Mobile app", "Brand"].map((name) => (
                  <SidebarMenuItem key={name}>
                    <SidebarMenuButton>
                      <FolderClosed />
                      <SidebarLabel>{name}</SidebarLabel>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset />
    </SidebarProvider>
  )
}
