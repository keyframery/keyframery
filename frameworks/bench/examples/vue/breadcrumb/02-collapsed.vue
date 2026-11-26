<script setup lang="ts">
// Collapsed with a menu
// Put `BreadcrumbEllipsis` in a menu trigger to list the pages a long trail leaves out. The menu unfolds from it.

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/keyframery/breadcrumb"
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/keyframery/menu"
</script>

<template>
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <Menu>
          <MenuTrigger>
            <template #render="{ props }">
              <button
                v-bind="props"
                type="button"
                aria-label="Show 2 more pages"
                class="cursor-pointer rounded-[7px] hover:bg-accent"
              >
                <BreadcrumbEllipsis />
              </button>
            </template>
          </MenuTrigger>
          <MenuContent align="start">
            <MenuItem value="guides">
              <template #render="{ props }">
                <a v-bind="props" href="/docs/guides">Guides</a>
              </template>
            </MenuItem>
            <MenuItem value="forms">
              <template #render="{ props }">
                <a v-bind="props" href="/docs/guides/forms">Forms</a>
              </template>
            </MenuItem>
          </MenuContent>
        </Menu>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>Validation</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
</template>
