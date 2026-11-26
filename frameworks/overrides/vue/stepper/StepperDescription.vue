<script lang="ts">
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { stepper } from "@/components/keyframery/core/stepper-core"
import { cn } from "@/lib/utils"
import { descriptionClass } from "./parts"

export default defineComponent({
  name: "StepperDescription",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof stepper, "description">,
  setup(_props, { attrs }) {
    return usePart(stepper, "description", undefined, () => ({ ...attrs, class: cn(descriptionClass, attrs.class as string) }), "span")
  },
})
</script>
