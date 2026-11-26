<script lang="ts">
/* The hairline at the point being read. */
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { sparkline } from "@/components/keyframery/core/sparkline-core"
import { cn } from "@/lib/utils"
import { cursorClass } from "./parts"

export default defineComponent({
  name: "SparklineCursor",
  inheritAttrs: false,
  
  slots: Object as PartSlots<typeof sparkline, "cursor">,
  setup(_props, { attrs }) {
    return usePart(sparkline, "cursor", undefined, () => ({ ...attrs, class: cn(cursorClass, attrs.class as string) }), "div")
  },
})
</script>
