<script setup lang="ts">
/* Mirrors src/demos/breadcrumb.tsx at its default controls (chevron, collapse). */
import { computed, ref } from "vue"

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/keyframery/breadcrumb"
import { Menu, MenuContent, MenuItem, MenuItemIcon, MenuTrigger } from "@/components/keyframery/menu"

type Node = { id: string; label: string; files: { name: string; meta: string; photo?: string }[] }
const tree: Node[] = [
  { id: "drive", label: "Studio Nord", files: [{ name: "Studio handbook.pdf", meta: "2.1 MB" }] },
  { id: "clients", label: "Clients", files: [{ name: "Rate card 2026.pdf", meta: "340 KB" }] },
  { id: "tram", label: "Lisbon Tram Co.", files: [{ name: "Signed contract.pdf", meta: "1.2 MB" }] },
  { id: "refresh", label: "2026 brand refresh", files: [{ name: "Moodboard.pdf", meta: "18 MB" }] },
  {
    id: "photo",
    label: "Photography",
    files: [
      { name: "Shot list.pdf", meta: "96 KB" },
      { name: "Location scout.jpg", meta: "4.8 MB", photo: "/demo/canal.jpg" },
    ],
  },
  {
    id: "shoot",
    label: "Alfama shoot",
    files: [
      { name: "Tram 28 at dawn.jpg", meta: "12 MB", photo: "/demo/coast-2.jpg" },
      { name: "Rooftop, first light.jpg", meta: "11 MB", photo: "/demo/coast-4.jpg" },
    ],
  },
]
const depth = ref(4)
const trail = computed(() => tree.slice(0, depth.value + 1))
const here = computed(() => trail.value[trail.value.length - 1])
const next = computed(() => tree[depth.value + 1])
const hidden = computed(() => (trail.value.length > 3 ? trail.value.slice(1, -2) : []))
const shown = computed(() => (hidden.value.length ? [trail.value[0], ...trail.value.slice(-2)] : trail.value))
</script>

<template>
  <div class="@container w-full max-w-[560px] rounded-[18px] bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
    <div class="flex min-h-14 items-center border-b border-border px-5 py-3">
      <Breadcrumb aria-label="Folder path">
        <BreadcrumbList>
          <template v-for="(node, index) in shown" :key="node.id">
            <template v-if="index === 1 && hidden.length">
              <BreadcrumbSeparator key="sep-more" />
              <BreadcrumbItem key="more">
                <Menu>
                  <MenuTrigger>
                    <template #render="{ props: p }">
                      <button
                        v-bind="p"
                        type="button"
                        :aria-label="`Show ${hidden.length} more folders`"
                        class="cursor-pointer rounded-[7px] text-muted-foreground outline-none transition-[background-color,color] duration-[calc(150ms*var(--kf-speed,1))] ease-house hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-open:bg-accent data-open:text-foreground motion-reduce:transition-none"
                      >
                        <BreadcrumbEllipsis />
                      </button>
                    </template>
                  </MenuTrigger>
                  <MenuContent align="start" class="w-52">
                    <MenuItem v-for="h in hidden" :key="h.id" :value="h.id" @select="depth = tree.indexOf(h)">
                      <MenuItemIcon>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder" aria-hidden="true"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" /></svg>
                      </MenuItemIcon>
                      {{ h.label }}
                    </MenuItem>
                  </MenuContent>
                </Menu>
              </BreadcrumbItem>
            </template>
            <BreadcrumbSeparator v-if="index > 0" />
            <BreadcrumbItem>
              <BreadcrumbPage v-if="node === here">
                <svg v-if="index === 0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hard-drive" aria-hidden="true"><path d="M10 16h.01" /><path d="M2.212 11.577a2 2 0 0 0-.212.896V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5.527a2 2 0 0 0-.212-.896L18.55 5.11A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /><path d="M21.946 12.013H2.054" /><path d="M6 16h.01" /></svg>
                {{ node.label }}
              </BreadcrumbPage>
              <BreadcrumbLink v-else :href="`/drive/${node.id}`" :data-crumb="node.id" @click.prevent="depth = tree.indexOf(node)">
                <svg v-if="index === 0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hard-drive" aria-hidden="true"><path d="M10 16h.01" /><path d="M2.212 11.577a2 2 0 0 0-.212.896V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5.527a2 2 0 0 0-.212-.896L18.55 5.11A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /><path d="M21.946 12.013H2.054" /><path d="M6 16h.01" /></svg>
                <span :class="index === 0 ? '@max-[26rem]:sr-only' : 'max-w-[9rem] truncate @max-[26rem]:max-w-[7rem]'">{{ node.label }}</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </template>
        </BreadcrumbList>
      </Breadcrumb>
    </div>

    <ul class="flex flex-col p-2">
      <li v-if="next">
        <button
          type="button"
          :data-folder="next.id"
          class="flex h-12 w-full cursor-pointer items-center gap-3 rounded-[10px] px-3 text-left outline-none transition-[background-color] duration-[calc(150ms*var(--kf-speed,1))] ease-house hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          @click="depth++"
        >
          <span class="grid size-8 place-items-center rounded-[8px] bg-muted text-muted-foreground [&_svg]:size-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder" aria-hidden="true"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" /></svg>
          </span>
          <span class="flex-1 truncate text-[13px] font-medium">{{ next.label }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right size-4 text-muted-foreground" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </li>
      <li v-for="f in here.files" :key="f.name" class="flex h-12 items-center gap-3 px-3">
        <img v-if="f.photo" :src="f.photo" alt="" class="size-8 shrink-0 rounded-[8px] bg-muted object-cover" />
        <span v-else class="grid size-8 shrink-0 place-items-center rounded-[8px] bg-muted text-muted-foreground [&_svg]:size-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text" aria-hidden="true"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>
        </span>
        <span class="flex-1 truncate text-[13px]">{{ f.name }}</span>
        <span class="text-[12px] text-muted-foreground tabular-nums">{{ f.meta }}</span>
      </li>
    </ul>
  </div>
</template>
