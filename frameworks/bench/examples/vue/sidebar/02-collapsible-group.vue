<script setup lang="ts">
// Collapsible group
// Pass `collapsible` to a group and its label folds it away. `SidebarMenuBadge` shows a count.

import { FolderClosed, Inbox, Star } from "@lucide/vue"

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
} from "@/components/keyframery/sidebar"
</script>

<template>
  <SidebarProvider
    :mobile-breakpoint="420"
    class="h-[300px] w-full max-w-[520px] overflow-hidden rounded-[14px] border bg-background"
  >
    <Sidebar>
      <SidebarContent class="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton is-active>
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
        <SidebarGroup collapsible default-open>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="name in ['Website', 'Mobile app', 'Brand']" :key="name">
                <SidebarMenuButton>
                  <FolderClosed />
                  <SidebarLabel>{{ name }}</SidebarLabel>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
    <SidebarInset />
  </SidebarProvider>
</template>
