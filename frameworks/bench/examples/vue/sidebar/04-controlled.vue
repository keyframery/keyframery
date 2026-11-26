<script setup lang="ts">
// Controlled
// Pass `collapsed` and `onCollapsedChange` to drive it from your own state, like a saved setting.

import { ref } from "vue"
import { Home, Inbox } from "@lucide/vue"

import { Button } from "@/components/keyframery/button"
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
} from "@/components/keyframery/sidebar"

const collapsed = ref(false)
</script>

<template>
  <SidebarProvider
    v-model:collapsed="collapsed"
    :mobile-breakpoint="420"
    class="h-[220px] w-full max-w-[520px] overflow-hidden rounded-[14px] border bg-background"
  >
    <Sidebar>
      <SidebarContent class="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton is-active tooltip="Home">
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
    <SidebarInset class="flex flex-col items-start gap-3 p-5">
      <span class="text-[13px] text-muted-foreground">collapsed: {{ String(collapsed) }}</span>
      <Button size="sm" @click="collapsed = !collapsed">{{ collapsed ? 'Expand' : 'Collapse' }}</Button>
    </SidebarInset>
  </SidebarProvider>
</template>
