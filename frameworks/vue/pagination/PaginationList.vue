<script setup lang="ts">
/* The row is a well, and the current-page key glides along it as a raised key (the list's `::before`,
   anchored to the current page). Without content it lays out Previous, the pages with their gaps, and Next. */
import { computed, useAttrs, useSlots } from "vue"
import { PaginationList as Part } from "@ui-sdk/vue/pagination"
import { cn } from "@/lib/utils"
import PaginationEllipsis from "./PaginationEllipsis.vue"
import PaginationItem from "./PaginationItem.vue"
import PaginationLink from "./PaginationLink.vue"
import PaginationNext from "./PaginationNext.vue"
import PaginationPrevious from "./PaginationPrevious.vue"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const slots = useSlots()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const names = computed(() => Object.keys(slots).filter((n) => n !== "default"))
const base = "relative isolate [anchor-scope:--kf-page] before:pointer-events-none before:absolute before:-z-10 before:opacity-0 before:content-[''] before:[position-anchor:--kf-page] before:top-[anchor(top)] before:right-[anchor(right)] before:bottom-[anchor(bottom)] before:left-[anchor(left)] before:[transition:top_calc(340ms*var(--kf-speed,1))_var(--ease-spring),right_calc(340ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(340ms*var(--kf-speed,1))_var(--ease-spring),left_calc(340ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(160ms*var(--kf-speed,1))_var(--ease-house)] has-[[data-slot=pagination-link][data-current]]:before:opacity-100 motion-reduce:before:[transition:none]! flex items-center gap-[var(--pagination-gap,0.125rem)] rounded-[var(--pagination-radius,12px)] bg-[var(--pagination-track,var(--muted))] p-1 shadow-[inset_0_1px_2px_rgb(0_0_0/0.07),inset_0_0_0_1px_rgb(0_0_0/0.035)] dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),inset_0_0_0_1px_rgb(255_255_255/0.04)] before:rounded-[var(--pagination-key-radius,9px)] before:bg-[var(--pagination-key,var(--background))] before:shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] dark:before:bg-[var(--pagination-key,var(--accent))] dark:before:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template #default="s">
      <slot v-bind="s ?? {}">
        <PaginationItem><PaginationPrevious /></PaginationItem>
        <PaginationItem v-for="item in s.state.items" :key="item">
          <PaginationLink v-if="typeof item === 'number'" :page="item" />
          <PaginationEllipsis v-else />
        </PaginationItem>
        <PaginationItem><PaginationNext /></PaginationItem>
      </slot>
    </template>
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
