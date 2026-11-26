<script lang="ts">
/* "Input", "Output" or "Error": a label and its value. */
import { defineComponent, type PropType } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { toolCall } from "@/components/keyframery/core/tool-call-core"
import { cn } from "@/lib/utils"
import { sectionClass } from "./parts"

export default defineComponent({
  name: "ToolCallSection",
  inheritAttrs: false,
  props: { kind: { type: String as PropType<"input" | "output" | "error">, default: undefined } },
  slots: Object as PartSlots<typeof toolCall, "section">,
  setup(props, { attrs }) {
    return usePart(toolCall, "section", () => ({ kind: props.kind }), () => ({ ...attrs, class: cn(sectionClass, attrs.class as string) }), "div")
  },
})
</script>
