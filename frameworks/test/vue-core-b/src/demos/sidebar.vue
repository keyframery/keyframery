<script setup lang="ts">
/* Mirrors src/demos/sidebar.tsx (default controls). */
import { computed, reactive, ref } from "vue"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/keyframery/sidebar"

const icons = {
  inbox: "M2.5 9.5h3l1 1.5h3l1-1.5h3M2.5 9.5l1.6-5.2a1 1 0 0 1 1-.8h5.8a1 1 0 0 1 1 .8l1.6 5.2v3a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1z",
  today: "M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.8 3.8l1 1M11.2 11.2l1 1M3.8 12.2l1-1M11.2 4.8l1-1M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z",
  upcoming: "M3 4.5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM3 7h10M5.5 2v2.5M10.5 2v2.5",
  project: "M5.5 3 4.5 13M11.5 3l-1 10M3 6h10.5M2.5 10h10.5",
  settings: "M2.5 4.5h6M11.5 4.5h2M2.5 11.5h2M7.5 11.5h6M10 3v3M6 10v3",
}
type Page = { id: string; title: string; icon: string; count?: number; tasks: [string, string][] }
const top: Page[] = [
  { id: "inbox", title: "Inbox", icon: icons.inbox, count: 4, tasks: [["Reply to the landlord about the boiler", "Today"], ["Book the MOT", "Fri"], ["Return the hedge trimmer to Gareth", ""]] },
  { id: "today", title: "Today", icon: icons.today, count: 3, tasks: [["Pick up the prescription", "Before 6pm"], ["Call Mum", ""], ["Pay the window cleaner", "£18"]] },
  { id: "upcoming", title: "Upcoming", icon: icons.upcoming, tasks: [["Dentist", "Tue 10:40"], ["Bins out", "Wed night"], ["Ellie’s birthday", "Sat"]] },
]
const projects: Page[] = [
  { id: "kitchen", title: "Kitchen refit", icon: icons.project, tasks: [["Choose the worktop", "Oak or quartz"], ["Measure for the extractor", ""], ["Second quote from Dawson’s", "Waiting"]] },
  { id: "garden", title: "Garden", icon: icons.project, tasks: [["Order the bulbs", "By October"], ["Fix the shed latch", ""], ["Move the rhubarb", ""]] },
  { id: "tax", title: "Tax return", icon: icons.project, tasks: [["Find the P60", ""], ["Add up the mileage", ""], ["File it", "31 Jan"]] },
]
const pages = [...top, ...projects]
const theme = { "--sidebar-width": "240px", "--sidebar-width-collapsed": "56px", "--sidebar-width-mobile": "272px", "--sidebar-height": "32px", "--sidebar-radius": "9px" }
const active = ref("inbox")
const done = reactive<Record<string, boolean>>({})
const page = computed(() => pages.find((p) => p.id === active.value) ?? pages[0])
const groups = [{ key: "top", items: top }]

if (typeof document !== "undefined" && !document.getElementById("kf-sidebar-demo")) {
  const s = document.createElement("style")
  s.id = "kf-sidebar-demo"
  s.textContent = "@keyframes kf-sidebar-page{from{opacity:0;translate:0 8px;filter:blur(4px)}}"
  document.head.append(s)
}
</script>

<template>
  <div data-demo="sidebar" class="w-full max-w-[600px]">
  <SidebarProvider
    :mobile-breakpoint="480"
    :style="theme"
    class="h-[380px] w-full max-w-[600px] overflow-hidden rounded-[16px] bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_2px_4px_-2px_rgb(0_0_0/0.06),0_16px_40px_-16px_rgb(0_0_0/0.18)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_16px_40px_-16px_rgb(0_0_0/0.7)]"
  >
    <Sidebar aria-label="Lists">
      <SidebarHeader>
        <SidebarTrigger class="h-8 w-10" />
        <span class="truncate text-[13px] font-semibold tracking-tight transition-[opacity,filter] duration-[calc(240ms*var(--kf-speed,1))] ease-house group-data-collapsed/sidebar-provider:opacity-0 group-data-collapsed/sidebar-provider:blur-[3px] motion-reduce:transition-none">Personal</span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup v-for="g in groups" :key="g.key">
          <SidebarGroupContent>
            <SidebarMenu :style="{ gap: '1px' }">
              <SidebarMenuItem v-for="p in g.items" :key="p.id">
                <SidebarMenuButton :data-page="p.id" :disabled="false" :is-active="active === p.id" :tooltip="p.title" @click="active = p.id">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="p.icon" /></svg>
                  <SidebarLabel>{{ p.title }}</SidebarLabel>
                  <SidebarMenuBadge v-if="p.count">{{ p.count }}</SidebarMenuBadge>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup collapsible :default-open="true">
          <SidebarGroupLabel data-group="projects">Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu :style="{ gap: '1px' }">
              <SidebarMenuItem v-for="p in projects" :key="p.id">
                <SidebarMenuButton :data-page="p.id" :disabled="false" :is-active="active === p.id" :tooltip="p.title" @click="active = p.id">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="p.icon" /></svg>
                  <SidebarLabel>{{ p.title }}</SidebarLabel>
                  <SidebarMenuBadge v-if="p.count">{{ p.count }}</SidebarMenuBadge>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings" :disabled="false">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="icons.settings" /></svg>
              <SidebarLabel>Settings</SidebarLabel>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>

    <SidebarInset class="flex flex-col px-6 py-5 group-data-mobile/sidebar-provider:px-4 group-data-mobile/sidebar-provider:py-3">
      <div class="-mx-1.5 mb-2 hidden items-center justify-between group-data-mobile/sidebar-provider:flex">
        <SidebarTrigger data-open-lists="true" aria-label="Lists">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" /></svg>
        </SidebarTrigger>
        <span class="px-1.5 text-[12px] text-muted-foreground">Personal</span>
      </div>
      <div :key="page.id" class="animate-[kf-sidebar-page_calc(420ms*var(--kf-speed,1))_var(--ease-spring)] motion-reduce:animate-none">
        <div class="flex items-baseline justify-between gap-4">
          <div class="truncate text-[17px] font-semibold tracking-tight">{{ page.title }}</div>
          <span class="shrink-0 text-[12px] text-muted-foreground tabular-nums">{{ page.tasks.filter(([t]) => !done[t]).length }} left</span>
        </div>
        <ul class="mt-4">
          <li v-for="[task, note] in page.tasks" :key="task" class="flex items-center gap-3 border-b border-border/70 py-2.5 last:border-0">
            <button
              type="button"
              :aria-pressed="!!done[task]"
              :aria-label="`Mark “${task}” done`"
              class="grid size-4 shrink-0 cursor-pointer place-items-center rounded-full shadow-[inset_0_0_0_1.5px_color-mix(in_oklab,var(--foreground)_28%,transparent)] transition-[background-color,box-shadow,scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop outline-none active:scale-90 focus-visible:ring-2 focus-visible:ring-ring aria-pressed:bg-foreground aria-pressed:shadow-none motion-reduce:transition-none"
              @click="done[task] = !done[task]"
            >
              <svg v-if="done[task]" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-2.5 text-background"><path d="m3.5 8.5 3 3 6-7" /></svg>
            </button>
            <span :class="`min-w-0 flex-1 truncate text-[13px] ${done[task] ? 'text-muted-foreground line-through' : ''}`">{{ task }}</span>
            <span v-if="note" class="shrink-0 text-[12px] text-muted-foreground tabular-nums">{{ note }}</span>
          </li>
        </ul>
      </div>
    </SidebarInset>
  </SidebarProvider>
  </div>
</template>
