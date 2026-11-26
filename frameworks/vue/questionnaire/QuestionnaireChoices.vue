<script lang="ts">
/* The answers: a radio group, or a checkbox group for a `multiple` item, controlled by the
   questionnaire, with one primary ring gliding to the chosen card. `groupClass` styles the group. */
import { defineComponent, h } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"
import { CheckboxGroup } from "@ui-sdk/vue/checkbox"
import { RadioGroup } from "@ui-sdk/vue/radio"

import { questionnaire } from "@/components/keyframery/core/questionnaire-core"
import { cn } from "@/lib/utils"
import { choicesClass, groupClass, radioGlide, radioGroupMotion, useItemName, useQuestionnaire } from "./parts"

export default defineComponent({
  name: "QuestionnaireChoices",
  inheritAttrs: false,
  props: {
    /** Classes for the radio or checkbox group inside. */
    groupClass: { type: String, default: undefined },
  },
  slots: Object as PartSlots<typeof questionnaire, "choices">,
  setup(props, { attrs, slots }) {
    const handle = useQuestionnaire()
    const name = useItemName("QuestionnaireChoices")
    return usePart(questionnaire, "choices", () => ({ name: name() }), () => ({ ...attrs, class: cn(choicesClass, attrs.class as string) }), {
      tag: "div",
      children: (state) => {
        const content = () => slots.default?.({ state })
        return state.multiple
          ? h(
              CheckboxGroup,
              {
                name: state.name,
                "aria-labelledby": state.labelledBy,
                "aria-invalid": state.invalid || undefined,
                value: Array.isArray(state.value) ? state.value : [],
                onValueChange: (next: string[], details: { event?: Event }) => handle.api.answer(state.name, next, details.event),
                class: cn(groupClass, props.groupClass),
              },
              content,
            )
          : h(
              RadioGroup,
              {
                name: state.name,
                "aria-labelledby": state.labelledBy,
                "aria-invalid": state.invalid || undefined,
                value: typeof state.value === "string" ? state.value : null,
                onValueChange: (next: string | null, details: { event?: Event }) => handle.api.answer(state.name, next ?? "", details.event),
                class: cn(radioGroupMotion, radioGlide, groupClass, props.groupClass),
              },
              content,
            )
      },
    })
  },
})
</script>
