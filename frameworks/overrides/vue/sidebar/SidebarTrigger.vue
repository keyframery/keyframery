<script lang="ts">
/* Narrows and widens the sidebar; on a narrow shell, opens and closes the sheet. */
import { defineComponent, h } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { sidebar } from "@/components/keyframery/core/sidebar-core"
import { cn } from "@/lib/utils"
import { triggerClass } from "./parts"

const icon = () =>
  h(
    "svg",
    { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", "stroke-width": "1.5", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" },
    [h("rect", { x: "2", y: "2.5", width: "12", height: "11", rx: "2.5" }), h("path", { d: "M6.5 2.5v11" })],
  )

export default defineComponent({
  name: "SidebarTrigger",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof sidebar, "trigger">,
  setup(_, { attrs, slots }) {
    return usePart(sidebar, "trigger", undefined, () => ({ ...attrs, class: cn(triggerClass, attrs.class as string) }), {
      tag: "button",
      children: (state) => (slots.default ? slots.default({ state }) : icon()),
    })
  },
})
</script>
