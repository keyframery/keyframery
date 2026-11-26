<script lang="ts">
/* A step's content, shown while it is current. It arrives from the side someone moved toward. */
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { stepper } from "@/components/keyframery/core/stepper-core"
import { cn } from "@/lib/utils"
import { panelClass } from "./parts"

export default defineComponent({
  name: "StepperPanel",
  inheritAttrs: false,
  props: { value: { type: String, required: true } },
  slots: Object as PartSlots<typeof stepper, "panel">,
  setup(props, { attrs }) {
    return usePart(stepper, "panel", () => ({ value: props.value }), () => ({ ...attrs, class: cn(panelClass, attrs.class as string) }), "div")
  },
})
</script>
