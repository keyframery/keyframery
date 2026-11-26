<script setup lang="ts">
/* Mirrors src/demos/context-menu.tsx at its defaults. */
import { ref } from "vue"
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuGroupLabel, ContextMenuItem, ContextMenuItemIcon, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/keyframery/context-menu"

const photos = [
  { name: "Flat white", src: "/demo/food-1.jpg" },
  { name: "Raspberries", src: "/demo/food-2.jpg" },
  { name: "Peppercorns and garlic", src: "/demo/food-3.jpg" },
  { name: "Last of the grapes", src: "/demo/food-4.jpg" },
  { name: "Tea, second pot", src: "/demo/food-5.jpg" },
  { name: "Raspberries again", src: "/demo/food-6.jpg" },
]
const albums = ["Kitchen", "Market days", "Favourites"]
const svg = { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", "stroke-width": "1.5", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" } as const
const theme = { "--context-menu-row-height": "32px", "--context-menu-radius": "14px" }
const active = ref(0)
function rightClickFrom(button: HTMLElement) {
  const tile = button.closest<HTMLElement>("[data-slot=menu-context-trigger]")
  if (!tile) return
  const r = button.getBoundingClientRect()
  tile.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, button: 2, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }))
}
</script>

<template>
  <div :style="theme" class="w-full max-w-[440px]">
    <div class="mb-3 flex items-baseline justify-between">
      <h3 class="text-[15px] font-semibold tracking-tight">Sunday kitchen</h3>
      <span class="text-[12px] text-muted-foreground tabular-nums">6 photos</span>
    </div>
    <ContextMenu :loop="true" :dismissible="true" @payload-change="(p: unknown) => (active = p as number)">
      <div class="grid grid-cols-3 gap-2">
        <ContextMenuTrigger v-for="(photo, i) in photos" :key="photo.name" :disabled="false" :tabindex="0" :aria-label="photo.name" :payload="i"
          class="group/photo relative aspect-[4/3] overflow-hidden rounded-[10px] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.06)] not-data-closed:ring-2 not-data-closed:ring-ring/70 not-data-closed:ring-offset-2 not-data-closed:ring-offset-background">
          <img :src="`http://localhost:4610${photo.src}`" alt="" draggable="false" class="absolute inset-0 size-full bg-muted object-cover" />
          <button type="button" :data-more="i" :aria-label="`More actions for ${photo.name}`" tabindex="-1" @click="rightClickFrom($event.currentTarget as HTMLElement)"
            class="absolute top-1.5 right-1.5 grid size-6 cursor-pointer place-items-center rounded-full bg-background/85 text-foreground opacity-0 shadow-[0_1px_3px_rgb(0_0_0/0.2)] backdrop-blur-sm transition-[opacity,scale] duration-[calc(150ms*var(--kf-speed,1))] ease-house group-hover/photo:opacity-100 group-not-data-closed/photo:opacity-100 active:scale-[0.92] motion-reduce:transition-none">
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class="size-3.5"><circle cx="3.5" cy="8" r="1.2" /><circle cx="8" cy="8" r="1.2" /><circle cx="12.5" cy="8" r="1.2" /></svg>
          </button>
        </ContextMenuTrigger>
      </div>
      <ContextMenuContent :style="{ ...theme, width: '208px' }" side="bottom" align="start" :side-offset="2" class="w-52">
        <ContextMenuGroup>
          <ContextMenuGroupLabel class="truncate">{{ photos[active]!.name }}</ContextMenuGroupLabel>
          <ContextMenuItem :close-on-select="true" value="rename"><ContextMenuItemIcon><svg v-bind="svg"><path d="M10.5 3 13 5.5 6 12.5H3.5V10z" /></svg></ContextMenuItemIcon>Rename</ContextMenuItem>
          <ContextMenuItem :close-on-select="true" value="duplicate" shortcut="mod+d"><ContextMenuItemIcon><svg v-bind="svg"><path d="M5.5 5.5h7v7h-7zM3.5 10.5v-7h7" /></svg></ContextMenuItemIcon>Duplicate</ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger><ContextMenuItemIcon><svg v-bind="svg"><path d="M2.5 5V12.5h11V6.5H8L6.5 5zM2.5 5V3.5h4L8 5" /></svg></ContextMenuItemIcon>Move to album</ContextMenuSubTrigger>
            <ContextMenuSubContent :style="theme" class="w-44">
              <ContextMenuItem v-for="album in albums.slice(0, 3)" :key="album" :close-on-select="true" :value="album">{{ album }}</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem :close-on-select="true" value="new-album">New album…</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuItem :close-on-select="true" value="delete" :destructive="true"><ContextMenuItemIcon><svg v-bind="svg"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5" /></svg></ContextMenuItemIcon>Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  </div>
</template>
