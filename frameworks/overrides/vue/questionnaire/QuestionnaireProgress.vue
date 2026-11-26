<script lang="ts">
/* "Question 2 of 3" over a thin track, the number rolling; the fill grows on a spring as you go. */
import { defineComponent, h } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { questionnaire } from "@/components/keyframery/core/questionnaire-core"
import { cn } from "@/lib/utils"
import { progressClass, roll } from "./parts"

export default defineComponent({
  name: "QuestionnaireProgress",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof questionnaire, "progress">,
  setup(_, { attrs, slots }) {
    return usePart(questionnaire, "progress", undefined, () => ({ ...attrs, class: cn(progressClass, attrs.class as string) }), {
      tag: "div",
      children: (state) =>
        slots.default
          ? slots.default({ state })
          : h("span", { class: "inline-flex" }, ["Question ", roll(state.current), ` of ${state.total}`]),
    })
  },
})
</script>
