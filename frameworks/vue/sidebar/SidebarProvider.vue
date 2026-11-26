<script lang="ts">
/* The app shell: the sidebar and the page beside it. It measures itself, and below
   `mobileBreakpoint` the sidebar becomes a sheet that slides in over the page. */
import { defineComponent, provide, type PropType } from "vue"
import type { ChangeDetails } from "@ui-sdk/core"
import { type PartSlots, usePart, usePrimitive } from "@ui-sdk/vue/primitive"

import { sidebar, type SidebarCollapsedChangeReason, type SidebarOpenMobileChangeReason } from "@/components/keyframery/core/sidebar-core"
import { type Speed, useSpeed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import { handleKey, providerClass } from "./parts"

export default defineComponent({
  name: "SidebarProvider",
  inheritAttrs: false,
  props: {
    /** Whether the sidebar is narrowed to the icon rail (`v-model:collapsed`). */
    collapsed: { type: Boolean, default: undefined },
    /** Whether the sidebar starts narrowed to the icon rail, when uncontrolled. */
    defaultCollapsed: { type: Boolean, default: undefined },
    /** Whether the sheet is open on a narrow shell (`v-model:open-mobile`). */
    openMobile: { type: Boolean, default: undefined },
    /** Whether the sheet starts open on a narrow shell, when uncontrolled. */
    defaultOpenMobile: { type: Boolean, default: undefined },
    /** Below this width of the provider, in px, the sidebar is a sheet over the page. */
    mobileBreakpoint: { type: Number, default: 640 },
    speed: { type: [String, Number] as PropType<Speed>, default: undefined },
  },
  emits: {
    collapsedChange: (_collapsed: boolean, _details: ChangeDetails<SidebarCollapsedChangeReason>) => true,
    "update:collapsed": (_collapsed: boolean) => true,
    openMobileChange: (_open: boolean, _details: ChangeDetails<SidebarOpenMobileChangeReason>) => true,
    "update:openMobile": (_open: boolean) => true,
  },
  slots: Object as PartSlots<typeof sidebar, "provider">,
  setup(props, { attrs, emit }) {
    const handle = usePrimitive(sidebar, () => ({
      collapsed: props.collapsed,
      defaultCollapsed: props.defaultCollapsed,
      openMobile: props.openMobile,
      defaultOpenMobile: props.defaultOpenMobile,
      mobileBreakpoint: props.mobileBreakpoint,
      onCollapsedChange: (collapsed, details) => {
        emit("collapsedChange", collapsed, details)
        if (!details.canceled) emit("update:collapsed", collapsed)
      },
      onOpenMobileChange: (open, details) => {
        emit("openMobileChange", open, details)
        if (!details.canceled) emit("update:openMobile", open)
      },
    }))
    provide(handleKey, handle)
    const speed = useSpeed(() => props.speed)
    return usePart(
      handle,
      "provider",
      () => ({}),
      () => ({ ...attrs, class: cn(providerClass, attrs.class as string), style: [speed.value, attrs.style as any] }),
      "div",
    )
  },
})
</script>
