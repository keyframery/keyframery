<script lang="ts">
/* One point of the keyboard layer. */
import { defineComponent, type PropType } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { sparkline } from "@/components/keyframery/core/sparkline-core"
import { cn } from "@/lib/utils"
import { pointClass } from "./parts"

export default defineComponent({
  name: "SparklinePoint",
  inheritAttrs: false,
  props: { value: { type: String as PropType<string>, required: true } },
  slots: Object as PartSlots<typeof sparkline, "point">,
  setup(props, { attrs }) {
    return usePart(sparkline, "point", () => ({ value: props.value }), () => ({ ...attrs, class: cn(pointClass, attrs.class as string) }), "div")
  },
})
</script>
