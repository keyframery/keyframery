<script lang="ts">
/* The line. */
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { sparkline } from "@/components/keyframery/core/sparkline-core"
import { cn } from "@/lib/utils"
import { lineMotion } from "./parts"

export default defineComponent({
  name: "SparklineLine",
  inheritAttrs: false,
  
  slots: Object as PartSlots<typeof sparkline, "line">,
  setup(_props, { attrs }) {
    return usePart(sparkline, "line", undefined, () => ({ ...attrs, class: cn(lineMotion, attrs.class as string) }), "path")
  },
})
</script>
