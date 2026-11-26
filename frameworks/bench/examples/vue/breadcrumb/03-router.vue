<script setup lang="ts">
// Your router's link and a custom separator
// `#render` puts the link's behaviour and motion on your router's own link. Pass any mark as the separator's content.

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/keyframery/breadcrumb"

/* Stands in for your router's link, such as Vue Router's RouterLink or Nuxt's NuxtLink. */
const RouterLink = "a"
</script>

<template>
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink>
          <template #render="{ props }">
            <component :is="RouterLink" v-bind="props" href="/team">Team</component>
          </template>
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator>/</BreadcrumbSeparator>
      <BreadcrumbItem>
        <BreadcrumbLink>
          <template #render="{ props }">
            <component :is="RouterLink" v-bind="props" href="/team/members">Members</component>
          </template>
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator>/</BreadcrumbSeparator>
      <BreadcrumbItem>
        <BreadcrumbPage>Inès Laurent</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
</template>
