<script lang="ts">
/* The line to the next step. Its ::after is the fill: it draws itself from the start (left, or the
   top in a vertical stepper) once the next step is reached. Takes its item's `value` when given none. */
import { defineComponent, inject } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { stepper } from "@/components/keyframery/core/stepper-core"
import { cn } from "@/lib/utils"
import { connectorClass, itemValueKey } from "./parts"

export default defineComponent({
  name: "StepperConnector",
  inheritAttrs: false,
  props: { value: { type: String, default: undefined } },
  slots: Object as PartSlots<typeof stepper, "connector">,
  setup(props, { attrs }) {
    const item = inject(itemValueKey, undefined)
    return usePart(
      stepper,
      "connector",
      () => ({ value: props.value ?? (item?.() as string) }),
      () => ({ ...attrs, class: cn(connectorClass, attrs.class as string) }),
      "span",
    )
  },
})
</script>
