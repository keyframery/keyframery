<script lang="ts">
/* One bar, keyed by its index as a string. */
import { defineComponent, type PropType } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { sparkline } from "@/components/keyframery/core/sparkline-core"
import { cn } from "@/lib/utils"
import { barMotion } from "./parts"

export default defineComponent({
  name: "SparklineBar",
  inheritAttrs: false,
  props: { value: { type: String as PropType<string>, required: true } },
  slots: Object as PartSlots<typeof sparkline, "bar">,
  setup(props, { attrs }) {
    return usePart(sparkline, "bar", () => ({ value: props.value }), () => ({ ...attrs, class: cn(barMotion, attrs.class as string) }), "div")
  },
})
</script>
