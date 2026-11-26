<script setup lang="ts">
/* #/<slug> shows src/demos/<slug>.vue, like the React lab. */
import { computed, defineAsyncComponent, onBeforeUnmount, ref, type Component } from "vue"

/* Lazy, so one broken demo never takes the others down. */
const demos = import.meta.glob<{ default: Component }>("./demos/*.vue")
const bySlug = Object.fromEntries(Object.entries(demos).map(([file, load]) => [file.slice(8, -4), defineAsyncComponent(load)]))
const read = () => location.hash.replace(/^#\/?/, "").split("?")[0]
const slug = ref(read())
const onHash = () => (slug.value = read())
window.addEventListener("hashchange", onHash)
onBeforeUnmount(() => window.removeEventListener("hashchange", onHash))
const current = computed(() => bySlug[slug.value])
</script>

<template>
  <main class="flex min-h-screen flex-col items-center gap-16 px-8 py-16 text-foreground">
    <component :is="current" v-if="current" :key="slug" />
    <nav v-else class="flex flex-wrap gap-3 text-[13px]">
      <a v-for="s in Object.keys(bySlug)" :key="s" :href="`#/${s}`" class="underline">{{ s }}</a>
    </nav>
  </main>
</template>
