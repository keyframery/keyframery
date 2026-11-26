<script lang="ts">
/* The fill under the line, for type="area". Give it `fill`, as SparklineSvg does with a gradient. */
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { sparkline } from "@/components/keyframery/core/sparkline-core"
import { cn } from "@/lib/utils"
import { areaMotion } from "./parts"

export default defineComponent({
  name: "SparklineArea",
  inheritAttrs: false,
  
  slots: Object as PartSlots<typeof sparkline, "area">,
  setup(_props, { attrs }) {
    return usePart(sparkline, "area", undefined, () => ({ ...attrs, class: cn(areaMotion, attrs.class as string) }), "path")
  },
})
</script>
