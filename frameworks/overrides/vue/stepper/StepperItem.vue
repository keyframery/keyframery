<script lang="ts">
/* One step's place in the list: indicator, text and the connector to the next step. The indicator
   and connector inside take its `value` when they're given none. */
import { defineComponent, provide } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { stepper } from "@/components/keyframery/core/stepper-core"
import { cn } from "@/lib/utils"
import { itemClass, itemValueKey } from "./parts"

export default defineComponent({
  name: "StepperItem",
  inheritAttrs: false,
  props: { value: { type: String, required: true } },
  slots: Object as PartSlots<typeof stepper, "item">,
  setup(props, { attrs }) {
    provide(itemValueKey, () => props.value)
    return usePart(
      stepper,
      "item",
      () => ({ value: props.value }),
      () => ({ ...attrs, value: props.value, class: cn(itemClass, attrs.class as string) }),
      "li",
    )
  },
})
</script>
