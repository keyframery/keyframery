<script lang="ts">
/* The ordered list of steps. Without content it renders each step from `steps`: indicator, title,
   description and connector. Its default slot receives `{ state }` with the steps. */
import { defineComponent, h } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { stepper } from "@/components/keyframery/core/stepper-core"
import { cn } from "@/lib/utils"
import { listClass, listDescriptionClass, wordsClass } from "./parts"
import StepperConnector from "./StepperConnector.vue"
import StepperDescription from "./StepperDescription.vue"
import StepperIndicator from "./StepperIndicator.vue"
import StepperItem from "./StepperItem.vue"
import StepperStep from "./StepperStep.vue"
import StepperTitle from "./StepperTitle.vue"

export default defineComponent({
  name: "StepperList",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof stepper, "list">,
  setup(_props, { attrs, slots }) {
    return usePart(stepper, "list", undefined, () => ({ ...attrs, class: cn(listClass, attrs.class as string) }), {
      tag: "ol",
      children: (state) =>
        slots.default
          ? slots.default({ state })
          : state.steps.map((step) =>
              h(StepperItem, { key: step.value, value: step.value }, () => [
                h(StepperStep, { value: step.value }, () => [
                  h(StepperIndicator, { value: step.value }),
                  h("span", { class: wordsClass }, [
                    h(StepperTitle, null, () => step.label),
                    " ",
                    step.description ? h(StepperDescription, { class: listDescriptionClass }, () => step.description) : null,
                  ]),
                ]),
                h(StepperConnector, { value: step.value }),
              ]),
            ),
    })
  },
})
</script>
