<script setup lang="ts">
// A list of links
// Inside `ItemGroup`, rows rendered as links share one highlight that glides to the row under the
// pointer or the keyboard focus. Rows arrive one after another when the list mounts.

import { ChevronRight } from "@lucide/vue"

import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemSeparator, ItemTitle } from "@/components/keyframery/item"

const settings = [
  { href: "#profile", title: "Profile", description: "Name, photo and the email we write to" },
  { href: "#billing", title: "Billing", description: "Visa ending 4242, renews 3 December" },
  { href: "#sessions", title: "Signed-in devices", description: "This MacBook and an iPhone" },
]
</script>

<template>
  <ItemGroup aria-label="Account" class="w-full max-w-[400px]">
    <template v-for="(s, i) in settings" :key="s.href">
      <ItemSeparator v-if="i > 0" />
      <Item size="sm">
        <template #render="{ props }">
          <a v-bind="props" :href="s.href">
            <ItemContent>
              <ItemTitle>{{ s.title }}</ItemTitle>
              <ItemDescription>{{ s.description }}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <ChevronRight />
            </ItemActions>
          </a>
        </template>
      </Item>
    </template>
  </ItemGroup>
</template>
