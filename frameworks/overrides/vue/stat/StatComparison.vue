<script lang="ts">
/* What the delta compares against, like "vs last 30 days". */
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { stat } from "@/components/keyframery/core/stat-core"
import { cn } from "@/lib/utils"
import { comparisonClass } from "./parts"

export default defineComponent({
  name: "StatComparison",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof stat, "comparison">,
  setup(_props, { attrs }) {
    return usePart(stat, "comparison", undefined, () => ({ ...attrs, class: cn(comparisonClass, attrs.class as string) }), "div")
  },
})
</script>
