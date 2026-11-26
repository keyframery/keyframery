<script lang="ts">
/* The dot that rides to the point being read, on lines and areas. */
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { sparkline } from "@/components/keyframery/core/sparkline-core"
import { cn } from "@/lib/utils"
import { markerClass } from "./parts"

export default defineComponent({
  name: "SparklineMarker",
  inheritAttrs: false,
  
  slots: Object as PartSlots<typeof sparkline, "marker">,
  setup(_props, { attrs }) {
    return usePart(sparkline, "marker", undefined, () => ({ ...attrs, class: cn(markerClass, attrs.class as string) }), "div")
  },
})
</script>
