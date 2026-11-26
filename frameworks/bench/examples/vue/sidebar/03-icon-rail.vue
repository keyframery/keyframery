<script setup lang="ts">
// Icon rail
// `SidebarTrigger` narrows the sidebar to its icons and back. On the rail, `tooltip` names each item.

import { Home, Inbox, Settings } from "@lucide/vue"

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
} from "@/components/keyframery/sidebar"

const items = [
  { title: "Home", icon: Home },
  { title: "Inbox", icon: Inbox },
  { title: "Settings", icon: Settings },
]
</script>

<template>
  <SidebarProvider
    default-collapsed
    :mobile-breakpoint="420"
    class="h-[260px] w-full max-w-[520px] overflow-hidden rounded-[14px] border bg-background"
  >
    <Sidebar>
      <SidebarHeader>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="(item, i) in items" :key="item.title">
                <SidebarMenuButton :is-active="i === 0" :tooltip="item.title">
                  <component :is="item.icon" />
                  <SidebarLabel>{{ item.title }}</SidebarLabel>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
    <SidebarInset class="p-5 text-[13px] text-muted-foreground">Press the button at the top to widen it.</SidebarInset>
  </SidebarProvider>
</template>
