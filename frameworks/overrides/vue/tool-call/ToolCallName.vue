<script lang="ts">
/* The tool's own name, in a small mono chip. It gives way first when the row is narrow. */
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { toolCall } from "@/components/keyframery/core/tool-call-core"
import { cn } from "@/lib/utils"
import { nameClass } from "./parts"

export default defineComponent({
  name: "ToolCallName",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof toolCall, "name">,
  setup(_props, { attrs }) {
    return usePart(toolCall, "name", () => ({}), () => ({ ...attrs, class: cn(nameClass, attrs.class as string) }), "code")
  },
})
</script>
