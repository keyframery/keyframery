<script lang="ts">
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { stepper } from "@/components/keyframery/core/stepper-core"
import { cn } from "@/lib/utils"
import { titleClass } from "./parts"

export default defineComponent({
  name: "StepperTitle",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof stepper, "title">,
  setup(_props, { attrs }) {
    return usePart(stepper, "title", undefined, () => ({ ...attrs, class: cn(titleClass, attrs.class as string) }), "span")
  },
})
</script>
