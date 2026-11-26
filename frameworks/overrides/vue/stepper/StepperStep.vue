<script lang="ts">
/* The step: a button in an interactive stepper, plain text in a progress strip. */
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { stepper } from "@/components/keyframery/core/stepper-core"
import { cn } from "@/lib/utils"
import { stepClass } from "./parts"

export default defineComponent({
  name: "StepperStep",
  inheritAttrs: false,
  props: { value: { type: String, required: true } },
  slots: Object as PartSlots<typeof stepper, "step">,
  setup(props, { attrs }) {
    return usePart(stepper, "step", () => ({ value: props.value }), () => ({ ...attrs, class: cn(stepClass, attrs.class as string) }), "button")
  },
})
</script>
