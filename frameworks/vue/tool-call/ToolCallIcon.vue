<script lang="ts">
/* Decorative, 16px. With no content it shows the call's status; pass your own icon to name the tool. */
import { defineComponent, h } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { toolCall } from "@/components/keyframery/core/tool-call-core"
import { cn } from "@/lib/utils"
import ToolCallMarks from "./ToolCallMarks.vue"
import { iconClass } from "./parts"

export default defineComponent({
  name: "ToolCallIcon",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof toolCall, "icon">,
  setup(_props, { attrs, slots }) {
    return usePart(toolCall, "icon", () => ({}), () => ({ ...attrs, class: cn(iconClass, attrs.class as string) }), { tag: "span", children: () => slots.default?.({ state: {} as never }) ?? h(ToolCallMarks) })
  },
})
</script>
