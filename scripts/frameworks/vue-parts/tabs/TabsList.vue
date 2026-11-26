<script lang="ts">
import type { PartProps } from "@/lib/keyframery"
import type { TabsList as SdkTabsList } from "@ui-sdk/vue/tabs"

/** Props of TabsList: everything UI SDK's TabsList takes (its props, its events as on* props, its element's attributes). */
export type TabsListProps = PartProps<typeof SdkTabsList>
</script>

<script setup lang="ts">
/* @@BANNER
   The list draws its own key (the indicator), a raised surface that stretches toward the tab you pick.
   Inside the key: a copy of the labels in the selected colour, clipped to the key and offset by its
   own moving edges, so it stays still while the key passes over it (React: Children.map over the
   tabs). The copy is drawn from the same slot content as the tabs. */
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, useSlots } from "vue"
import { TabsIndicator as TabsIndicatorPart, TabsList as TabsListPart } from "@ui-sdk/vue/tabs"
import { LabelCopies } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
defineProps</* @vue-ignore */ TabsListProps>()
const attrs = useAttrs() as any
const forwarded = computed<any>(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const slots = useSlots()
const namedSlots = computed(() => Object.keys(slots).filter((name) => name !== "default"))
/* Hold the transitions until UI SDK has measured, so the key is simply there on load. */
const ready = ref(false)
let readyTimer: ReturnType<typeof setTimeout> | undefined
onMounted(() => {
  readyTimer = setTimeout(() => (ready.value = true), 150)
})
onBeforeUnmount(() => clearTimeout(readyTimer))
const list = @@CLASS(TabsList,0,orig)
const key = @@CLASS(TabsList,1,orig)
const clip = @@CLASS(TabsList,2,orig)
const row = @@CLASS(TabsList,3,orig)
const tabBox = @@CONST(ui/tabs, tabBox)
</script>

<template>
  <TabsListPart v-bind="forwarded" :class="cn(list, attrs.class as any)">
    <template #default="scope">
      <slot v-bind="scope ?? {}" />
      <TabsIndicatorPart :data-ready="ready || undefined" :aria-hidden="true" :class="key">
        <span :class="clip">
          <span :class="row">
            <LabelCopies :nodes="slots.default?.(scope ?? {})" :box-class="tabBox" />
          </span>
        </span>
      </TabsIndicatorPart>
    </template>
    <template v-for="name in namedSlots" :key="name" #[name]="s">
      <slot :name="name" v-bind="s ?? {}" />
    </template>
  </TabsListPart>
</template>
