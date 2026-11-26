<script lang="ts">
/* The status in words; red when it failed. With no content it says the status ("Running", "Needs approval"); a new label rises into place. */
import { defineComponent, h } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { statusLabels, toolCall } from "@/components/keyframery/core/tool-call-core"
import { cn } from "@/lib/utils"
import { statusClass, statusLabelClass } from "./parts"

export default defineComponent({
  name: "ToolCallStatusText",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof toolCall, "status">,
  setup(_props, { attrs, slots }) {
    return usePart(toolCall, "status", () => ({}), () => ({ ...attrs, class: cn(statusClass, attrs.class as string) }), {
      tag: "span",
      children: (state) =>
        h("span", { key: state.status, class: statusLabelClass }, slots.default ? slots.default({ state }) : statusLabels[state.status]),
    })
  },
})
</script>
