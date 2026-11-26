<script setup lang="ts">
// Basic
// Mark the current page with `isActive`. The highlight glides to it.

import { ref } from "vue"
import { Calendar, Home, Inbox, Search } from "@lucide/vue"

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

const pages = [
  { title: "Home", icon: Home },
  { title: "Inbox", icon: Inbox },
  { title: "Calendar", icon: Calendar },
  { title: "Search", icon: Search },
]

const active = ref("Home")
</script>

<template>
  <SidebarProvider
    :mobile-breakpoint="420"
    class="h-[280px] w-full max-w-[520px] overflow-hidden rounded-[14px] border bg-background"
  >
    <Sidebar>
      <SidebarContent class="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="page in pages" :key="page.title">
                <SidebarMenuButton :is-active="active === page.title" @click="active = page.title">
                  <component :is="page.icon" />
                  <SidebarLabel>{{ page.title }}</SidebarLabel>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
    <SidebarInset class="p-5 text-[15px] font-semibold">{{ active }}</SidebarInset>
  </SidebarProvider>
</template>
