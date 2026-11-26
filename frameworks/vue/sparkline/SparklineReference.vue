<script lang="ts">
/* The dashed line at `reference`. It glides when the value or the range changes. */
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { sparkline } from "@/components/keyframery/core/sparkline-core"
import { cn } from "@/lib/utils"
import { referenceClass } from "./parts"

export default defineComponent({
  name: "SparklineReference",
  inheritAttrs: false,
  
  slots: Object as PartSlots<typeof sparkline, "reference">,
  setup(_props, { attrs }) {
    return usePart(sparkline, "reference", undefined, () => ({ ...attrs, class: cn(referenceClass, attrs.class as string) }), "div")
  },
})
</script>
