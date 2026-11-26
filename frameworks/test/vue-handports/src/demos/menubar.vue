<script setup lang="ts">
/* Mirrors src/demos/menubar.tsx at its defaults. */
import { Menu, Menubar, MenuCheckboxItem, MenuContent, MenuGroupLabel, MenuItem, MenuItemIndicator, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuSub, MenuSubContent, MenuSubTrigger, MenuTrigger } from "@/components/keyframery/menubar"

const tiles = [28, 29, 15, 17, 18, 19]
const theme = { "--menubar-radius": "14px", "--menubar-item-radius": "8px", "--menubar-gap": "2px" }
</script>

<template>
  <div :style="{ ...theme, maxWidth: '440px' }" class="w-full max-w-[440px] overflow-hidden rounded-[14px] bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),0_8px_24px_-12px_rgb(0_0_0/0.6)]">
    <div class="flex items-center gap-2 border-b border-border px-1.5 py-1.5">
      <Menubar aria-label="Photos" orientation="horizontal" :disabled="false" :loop="true" modal="pointer">
        <Menu :loop="true" :dismissible="true">
          <MenuTrigger>Photo</MenuTrigger>
          <MenuContent side="bottom" align="start" style="width: 224px" class="w-56">
            <MenuItem :close-on-select="true" value="import" shortcut="mod+shift+i">Import…</MenuItem>
            <MenuItem :close-on-select="true" value="duplicate" shortcut="mod+d">Duplicate</MenuItem>
            <MenuSub>
              <MenuSubTrigger>Export</MenuSubTrigger>
              <MenuSubContent class="w-44">
                <MenuItem :close-on-select="true" value="jpeg">JPEG</MenuItem>
                <MenuItem :close-on-select="true" value="png">PNG</MenuItem>
                <MenuItem :close-on-select="true" value="original">Unmodified original</MenuItem>
              </MenuSubContent>
            </MenuSub>
            <MenuSeparator />
            <MenuItem :close-on-select="true" value="trash" shortcut="mod+backspace" :destructive="true">Move to Trash</MenuItem>
          </MenuContent>
        </Menu>
        <Menu :loop="true" :dismissible="true">
          <MenuTrigger>Edit</MenuTrigger>
          <MenuContent side="bottom" align="start" style="width: 208px" class="w-52">
            <MenuItem :close-on-select="true" value="undo" shortcut="mod+z" :disabled="true">Undo</MenuItem>
            <MenuItem :close-on-select="true" value="redo" shortcut="mod+shift+z">Redo</MenuItem>
            <MenuSeparator />
            <MenuItem :close-on-select="true" value="crop" shortcut="c">Crop</MenuItem>
            <MenuItem :close-on-select="true" value="rotate" shortcut="mod+r">Rotate</MenuItem>
            <MenuItem :close-on-select="true" value="adjust" shortcut="a">Adjust colour</MenuItem>
          </MenuContent>
        </Menu>
        <Menu :loop="true" :dismissible="true">
          <MenuTrigger>View</MenuTrigger>
          <MenuContent side="bottom" align="start" style="width: 208px" class="w-52">
            <MenuCheckboxItem value="filmstrip" :default-checked="true">Show filmstrip<MenuItemIndicator /></MenuCheckboxItem>
            <MenuCheckboxItem value="info">Show info<MenuItemIndicator /></MenuCheckboxItem>
            <MenuSeparator />
            <MenuRadioGroup default-value="date">
              <MenuGroupLabel>Sort by</MenuGroupLabel>
              <MenuRadioItem value="date">Date taken<MenuItemIndicator /></MenuRadioItem>
              <MenuRadioItem id="kf-sort-name" value="name">Name<MenuItemIndicator /></MenuRadioItem>
              <MenuRadioItem value="rating">Rating<MenuItemIndicator /></MenuRadioItem>
            </MenuRadioGroup>
          </MenuContent>
        </Menu>
        <Menu :loop="true" :dismissible="true">
          <MenuTrigger>Share</MenuTrigger>
          <MenuContent side="bottom" align="start" style="width: 192px" class="w-48">
            <MenuItem :close-on-select="true" value="link">Copy link</MenuItem>
            <MenuItem :close-on-select="true" value="album">Add to shared album</MenuItem>
            <MenuItem :close-on-select="true" value="email">Email</MenuItem>
          </MenuContent>
        </Menu>
      </Menubar>
    </div>
    <div class="p-3">
      <div class="mb-2.5 flex items-baseline justify-between px-0.5">
        <span class="text-[13px] font-medium">Hill walk, March</span>
        <span class="text-[12px] text-muted-foreground tabular-nums">31 photos</span>
      </div>
      <div class="grid grid-cols-3 gap-1.5">
        <img v-for="id in tiles" :key="id" :src="`http://localhost:4610/demo/walk-${id}.jpg`" alt="" draggable="false" class="block aspect-[4/3] w-full rounded-[8px] bg-muted object-cover" />
      </div>
    </div>
  </div>
</template>
