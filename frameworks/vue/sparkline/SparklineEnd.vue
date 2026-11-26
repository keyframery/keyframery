<script lang="ts">
/* The last point. It pops in once the line has drawn up to it, and follows new data. */
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { sparkline } from "@/components/keyframery/core/sparkline-core"
import { cn } from "@/lib/utils"
import { endClass } from "./parts"

export default defineComponent({
  name: "SparklineEnd",
  inheritAttrs: false,
  
  slots: Object as PartSlots<typeof sparkline, "end">,
  setup(_props, { attrs }) {
    return usePart(sparkline, "end", undefined, () => ({ ...attrs, class: cn(endClass, attrs.class as string) }), "div")
  },
})
</script>
