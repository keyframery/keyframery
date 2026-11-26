<script lang="ts">
/* A dot on the highest (value="max") or lowest (value="min") point, shown by `extremes`. */
import { defineComponent, type PropType } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { sparkline } from "@/components/keyframery/core/sparkline-core"
import { cn } from "@/lib/utils"
import { extremeClass } from "./parts"

export default defineComponent({
  name: "SparklineExtreme",
  inheritAttrs: false,
  props: { value: { type: String as PropType<"max" | "min">, required: true } },
  slots: Object as PartSlots<typeof sparkline, "extreme">,
  setup(props, { attrs }) {
    return usePart(sparkline, "extreme", () => ({ value: props.value }), () => ({ ...attrs, class: cn(extremeClass, attrs.class as string) }), "div")
  },
})
</script>
