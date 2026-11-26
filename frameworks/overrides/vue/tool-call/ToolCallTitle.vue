<script lang="ts">
/* The call's title. The light runs across it while the call runs. */
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { toolCall } from "@/components/keyframery/core/tool-call-core"
import { cn } from "@/lib/utils"
import { titleClass } from "./parts"

export default defineComponent({
  name: "ToolCallTitle",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof toolCall, "title">,
  setup(_props, { attrs }) {
    return usePart(toolCall, "title", () => ({}), () => ({ ...attrs, class: cn(titleClass, attrs.class as string) }), "span")
  },
})
</script>
