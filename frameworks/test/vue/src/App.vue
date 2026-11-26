<script setup lang="ts">
/* #/<slug>/<example> renders src/examples/<slug>/<example>.vue (the bench's conversions of
   src/examples, synced by scripts/frameworks/sync-test.mjs) alone, like the React bench at the same
   hash. #/<slug> renders every example of that component; no hash lists them. */
import { computed, onBeforeUnmount, ref, shallowRef, watchEffect, type Component } from "vue"

const modules = import.meta.glob<{ default: Component }>("./examples/*/*.vue")
const index: Record<string, string[]> = {}
for (const k of Object.keys(modules)) {
  const m = k.match(/examples\/([^/]+)\/([^/]+)\.vue$/)
  if (m) (index[m[1]] ??= []).push(m[2])
}
for (const list of Object.values(index)) list.sort((a, b) => (a === "usage" ? -1 : b === "usage" ? 1 : a.localeCompare(b)))

const hash = ref(location.hash.replace(/^#\/?/, ""))
const onHash = () => (hash.value = location.hash.replace(/^#\/?/, ""))
window.addEventListener("hashchange", onHash)
onBeforeUnmount(() => window.removeEventListener("hashchange", onHash))

const shown = shallowRef<{ id: string; C: Component }[]>([])
watchEffect(async () => {
  const id = hash.value
  const ids = id.includes("/") ? [id] : (index[id] ?? []).map((e) => `${id}/${e}`)
  const loaded = await Promise.all(ids.filter((i) => modules[`./examples/${i}.vue`]).map(async (i) => ({ id: i, C: (await modules[`./examples/${i}.vue`]()).default })))
  shown.value = loaded
  requestAnimationFrame(() => document.documentElement.setAttribute("data-bench-ready", "ok"))
})
const listed = computed(() => !hash.value)
</script>

<template>
  <!-- One example: the React bench's exact stage (frameworks/bench/react/src/main.tsx), so sizes compare. -->
  <main v-if="!listed && shown.length === 1" data-bench-stage class="flex min-h-screen justify-center bg-background px-10 py-16 text-foreground">
    <div :data-bench-example="shown[0].id" class="flex w-[640px] justify-center">
      <component :is="shown[0].C" />
    </div>
  </main>
  <main v-else-if="!listed" data-bench-stage class="flex min-h-screen flex-col items-center gap-16 bg-background px-10 py-16 text-foreground">
    <div v-for="e in shown" :key="e.id" :data-bench-example="e.id" class="flex w-[640px] justify-center">
      <component :is="e.C" />
    </div>
  </main>
  <main v-else class="mx-auto max-w-[900px] p-10 text-[13px]">
    <p v-for="(list, slug) in index" :key="slug">
      <a class="font-semibold underline" :href="`#/${slug}`">{{ slug }}</a>
      <a v-for="e in list" :key="e" class="ml-2 underline" :href="`#/${slug}/${e}`">{{ e }}</a>
    </p>
  </main>
</template>
