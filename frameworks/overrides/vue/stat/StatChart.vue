<script lang="ts">
/* Holds a Sparkline (or any small chart) under the number. Its data-tone matches the delta. */
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { stat } from "@/components/keyframery/core/stat-core"
import { cn } from "@/lib/utils"
import { chartClass } from "./parts"

export default defineComponent({
  name: "StatChart",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof stat, "chart">,
  setup(_props, { attrs }) {
    return usePart(stat, "chart", undefined, () => ({ ...attrs, class: cn(chartClass, attrs.class as string) }), "div")
  },
})
</script>
