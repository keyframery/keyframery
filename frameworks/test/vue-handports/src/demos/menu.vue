<script setup lang="ts">
/* Mirrors src/demos/menu.tsx at its defaults. */
import { Menu, MenuCheckboxItem, MenuContent, MenuGroup, MenuGroupLabel, MenuItem, MenuItemIcon, MenuItemIndicator, MenuSeparator, MenuSub, MenuSubContent, MenuSubTrigger, MenuTrigger } from "@/components/keyframery/menu"

const playlists = ["Road trip", "Late night focus", "Sunday cooking"]
const svg = { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", "stroke-width": "1.5", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" } as const
const theme = { "--menu-radius": "14px", "--menu-item-radius": "8px" }
</script>

<template>
  <div :style="theme" class="flex w-full max-w-[380px] items-center gap-3 rounded-[14px] bg-background p-2.5 pr-3 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
    <img src="http://localhost:4610/demo/gig.jpg" alt="" class="size-12 shrink-0 rounded-[9px] bg-muted object-cover" />
    <div class="min-w-0 flex-1">
      <div class="truncate text-[14px] font-medium tracking-tight">Slow Morning</div>
      <div class="mt-0.5 truncate text-[12px] text-muted-foreground">Lina Hart, live at the Roundhouse</div>
    </div>
    <span class="text-[12px] text-muted-foreground tabular-nums">3:42</span>
    <Menu :loop="true" :dismissible="true" presentation="auto" modal="pointer">
      <MenuTrigger :disabled="false" :focusable-when-disabled="false" aria-label="More actions for Slow Morning" class="w-8 px-0">
        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><circle cx="3.5" cy="8" r="1.15" /><circle cx="8" cy="8" r="1.15" /><circle cx="12.5" cy="8" r="1.15" /></svg>
      </MenuTrigger>
      <MenuContent side="bottom" align="end" :side-offset="6" style="width: 240px" class="w-60">
        <MenuGroup>
          <MenuItem :close-on-select="true" value="play-next" shortcut="mod+enter"><MenuItemIcon><svg v-bind="svg"><path d="M2.5 4h7M2.5 8h7M2.5 12h4M11.5 9.5v4l3-2z" /></svg></MenuItemIcon>Play next</MenuItem>
          <MenuItem :close-on-select="true" value="queue" shortcut="mod+shift+q"><MenuItemIcon><svg v-bind="svg"><path d="M2.5 4h11M2.5 8h11M2.5 12h6M12 10.5v3M10.5 12h3" /></svg></MenuItemIcon>Add to queue</MenuItem>
          <MenuSub :loop="true">
            <MenuSubTrigger><MenuItemIcon><svg v-bind="svg"><path d="M8 3v10M3 8h10" /></svg></MenuItemIcon>Add to playlist</MenuSubTrigger>
            <MenuSubContent class="w-48">
              <MenuItem v-for="name in playlists" :key="name" :close-on-select="true" :value="name">{{ name }}</MenuItem>
              <MenuSeparator />
              <MenuItem :close-on-select="true" value="new-playlist">New playlist…</MenuItem>
            </MenuSubContent>
          </MenuSub>
          <MenuItem :close-on-select="true" value="share" shortcut="mod+shift+c"><MenuItemIcon><svg v-bind="svg"><path d="M8 10V2.5M5 5.5l3-3 3 3M3.5 9v3.5a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V9" /></svg></MenuItemIcon>Copy link</MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup>
          <MenuGroupLabel>Listening</MenuGroupLabel>
          <MenuCheckboxItem value="offline" :default-checked="true">Download for offline<MenuItemIndicator /></MenuCheckboxItem>
          <MenuCheckboxItem id="kf-lyrics" value="lyrics">Show lyrics<MenuItemIndicator /></MenuCheckboxItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuItem :close-on-select="true" value="remove" :destructive="true"><MenuItemIcon><svg v-bind="svg"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5" /></svg></MenuItemIcon>Remove from library</MenuItem>
      </MenuContent>
    </Menu>
  </div>
</template>
