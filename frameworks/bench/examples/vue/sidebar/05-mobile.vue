<script setup lang="ts">
// On a phone
// Below `mobileBreakpoint` (640px by default) the sidebar becomes a sheet. Put a `SidebarTrigger` in the page to open it; choosing an item closes it.

import { ref } from "vue"
import { Home, Inbox, Menu, Settings } from "@lucide/vue"

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
} from "@/components/keyframery/sidebar"

const items = [
  { title: "Home", icon: Home },
  { title: "Inbox", icon: Inbox },
  { title: "Settings", icon: Settings },
]

const active = ref("Home")
</script>

<template>
  <SidebarProvider class="h-[360px] w-full max-w-[340px] overflow-hidden rounded-[22px] border bg-background">
    <Sidebar>
      <SidebarContent class="pt-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in items" :key="item.title">
                <SidebarMenuButton :is-active="active === item.title" @click="active = item.title">
                  <component :is="item.icon" />
                  <SidebarLabel>{{ item.title }}</SidebarLabel>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
    <SidebarInset class="p-3">
      <div class="flex items-center gap-2">
        <SidebarTrigger aria-label="Open menu">
          <Menu />
        </SidebarTrigger>
        <span class="text-[15px] font-semibold">{{ active }}</span>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
