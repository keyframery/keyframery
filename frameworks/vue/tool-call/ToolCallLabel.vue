<script lang="ts">
/* "Input", "Output" or "Error". */
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { toolCall } from "@/components/keyframery/core/tool-call-core"
import { cn } from "@/lib/utils"
import { labelClass } from "./parts"

export default defineComponent({
  name: "ToolCallLabel",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof toolCall, "caption">,
  setup(_props, { attrs }) {
    return usePart(toolCall, "caption", () => ({}), () => ({ ...attrs, class: cn(labelClass, attrs.class as string) }), "div")
  },
})
</script>
