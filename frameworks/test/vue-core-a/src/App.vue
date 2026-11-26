<script setup lang="ts">
/* My core-built ports, one demo per file in src/demos (mirroring src/demos/<slug>.tsx's main state). #/<slug> shows one. */
import { computed, defineAsyncComponent, onBeforeUnmount, ref, type Component } from "vue"

/* Lazy, so one broken demo doesn't take the others down. */
const modules = import.meta.glob<{ default: Component }>("./demos/*.vue")
const demos = Object.entries(modules).map(([file, load]) => ({ slug: file.replace("./demos/", "").replace(".vue", ""), component: defineAsyncComponent(load) }))
const slug = ref(location.hash.replace(/^#\/?/, ""))
const onHash = () => (slug.value = location.hash.replace(/^#\/?/, ""))
window.addEventListener("hashchange", onHash)
onBeforeUnmount(() => window.removeEventListener("hashchange", onHash))
const shown = computed(() => demos.filter((d) => !slug.value || d.slug === slug.value))
</script>

<template>
  <!-- The React lab's single view: same width, border and stage, so geometry matches. -->
  <main class="min-h-screen bg-[oklch(0.975_0_0)] px-8 pt-[135.5px] pb-24 text-foreground dark:bg-[oklch(0.125_0_0)]">
    <div v-for="d in shown" :key="d.slug" class="mx-auto mb-12 max-w-[1116px] overflow-hidden rounded-[18px] border border-border bg-background">
      <div :data-demo="d.slug" class="relative">
        <div data-stage class="flex min-h-[560px] items-center justify-center rounded-[18px] bg-background p-10 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
          <component :is="d.component" />
        </div>
      </div>
    </div>
  </main>
</template>
