<script lang="ts">
/* How long the call took. */
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { toolCall } from "@/components/keyframery/core/tool-call-core"
import { cn } from "@/lib/utils"
import { durationClass } from "./parts"

export default defineComponent({
  name: "ToolCallDuration",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof toolCall, "duration">,
  setup(_props, { attrs }) {
    return usePart(toolCall, "duration", () => ({}), () => ({ ...attrs, class: cn(durationClass, attrs.class as string) }), "span")
  },
})
</script>
