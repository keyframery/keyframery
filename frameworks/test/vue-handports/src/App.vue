<script setup lang="ts">
/* #/<slug> shows one hand-ported demo, like the React lab. */
import { computed, defineAsyncComponent, onBeforeUnmount, ref } from "vue"

const demos = import.meta.glob("./demos/*.vue")
const slug = ref(location.hash.replace(/^#\/?/, "").split("?")[0])
const onHash = () => (slug.value = location.hash.replace(/^#\/?/, "").split("?")[0])
window.addEventListener("hashchange", onHash)
onBeforeUnmount(() => window.removeEventListener("hashchange", onHash))
const Demo = computed(() => {
  const load = demos[`./demos/${slug.value}.vue`]
  return load ? defineAsyncComponent(load as any) : null
})
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-background p-8 text-foreground">
    <component :is="Demo" v-if="Demo" :key="slug" />
    <ul v-else class="text-[13px]"><li v-for="k in Object.keys(demos)" :key="k"><a :href="`#/${k.slice(8, -4)}`">{{ k.slice(8, -4) }}</a></li></ul>
  </main>
</template>
